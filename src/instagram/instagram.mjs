import 'dotenv/config'
import InstagramPublisher from 'instagram-publisher'
import download from 'image-downloader'
import { join } from 'path'
import { unlink } from 'fs/promises'

const { INSTAGRAM_USERNAME, INSTAGRAM_PASSWORD } = process.env

export default class Instagram {
    constructor() {
        this.client = undefined
    }

    async login() {
        this.client = new InstagramPublisher({ email: INSTAGRAM_USERNAME, password: INSTAGRAM_PASSWORD, verbose: true })
    }

    async uploadPost({ post, image }) {
        const imageDest = join(process.cwd(), 'src', 'imgs', `image${Math.random()}.jpg`)
        await download.image({
            url: image,
            dest: imageDest
        })
        
        try{
            const post_published = await this.client.createSingleImage({
                image_path: imageDest,
                caption: post
            })
            
            return post_published

        } catch(err) {
            console.log(err)
        } finally {
            await unlink(imageDest)
        }

        return "published!"

    }
}