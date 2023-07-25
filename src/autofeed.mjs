import RssFeedEmitter from 'rss-feed-emitter'
import companies from './config/companies.json' assert { type: 'json' }
import events from './config/events.json' assert { type: 'json' }
import sentenceBoundaryDetection  from 'sbd'
import keyword_extractor  from 'keyword-extractor'
import Instagram from './instagram/instagram.mjs'

export default class Autofeed {
    constructor(lang = 'en') {
        this.feeder = new RssFeedEmitter()
        this.feeder.add(...companies.portals)
        this.canStart = false
        this.lang = lang
        this.instagram


        this.startEvents()
    }


    async startEvents() {
        
        await this.loginInstagram()
        events.events.map(event => {
            this.feeder.on(event, async (item) => {
                if(this.canStart) {
                    try {
                        setTimeout(async() => {
                            await this.publishContent(item, event)
                        }, 10000 + (2000 * (Math.random() * 10)))
                    }catch(err) {
                        console.log(err)
                    }
                }
            })
        })

        setTimeout(() => {
            this.canStart = true
        }, 3000)
    }

    async loginInstagram() {
        const client = new Instagram()
        await client.login()
        this.instagram = client
        return this
    }

    async publishContent(content, source) {
        const { title, summary, link } = content
        const imageUrl = content.enclosures[0].url ?? content.image.url

        const cleanedSummary = this.#removeBlankLinesAndMarkDown(summary)
        const sentences = this.breakContentIntoSentences(cleanedSummary)
        const keywords = this.extractKeywords(cleanedSummary)

        const news = {
            title,
            link,
            imageUrl,
            ...sentences,
            keywords
        }

        const post = this.formatPost(news, source)
        await this.instagram.uploadPost({
            post,
            image: imageUrl
        })

        return post
    }

    formatPost(content, source) {
        let post = `${content.title}\n\n\n`

        content.sentences.map((item, index) => {
            if(index < (content.sentences.length - 1)) {
                post += `${item}\n\n`
            }
        })

        post += `\n\n`

        post += `Source: ${events.sites[source]}\n\n`

        content.keywords.map((word, index) => {
            if (index < 15) {
                post += `#${word.replace("-", "_")} `
            }
        })

        return post
    }

    breakContentIntoSentences(content) {
        const sentences = sentenceBoundaryDetection.sentences(content)
        const sentencesQuantity = sentences.length
        return {
            sentences,
            sentencesQuantity
        }
    }

    extractKeywords(text) {
        const languages = {
            pt: 'portuguese',
            en: 'english',
            fr: 'french',
            es: 'spanish'
        }

        const language = languages[this.lang]

        const keywords = keyword_extractor.extract(text, {
            language: language,
            remove_digits: true,
            return_changed_case:true,
            remove_duplicates: true
        })

        return keywords
    }

    #removeBlankLinesAndMarkDown(text) {
    
        const allLines = text.split('\n')
    
        const withoutBlankLinesAndMarkDown = allLines.filter((line) => {
            if(line.trim().length === 0 || line.trim().startsWith('=')){
                return false
            }
            return true
        })

        const textWithouHTML = withoutBlankLinesAndMarkDown.join(' ').replace(/(<([^>]+)>)/ig, '').trim()
        return this.#removeDateInParenteses(textWithouHTML)
    }

    #removeDateInParenteses(text) {
        return text.replace(/\((?:\([^()]*\)|[^()])*\)/gm, '').replace(/  /g,' ')
    }
}