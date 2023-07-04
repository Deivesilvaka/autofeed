import 'dotenv/config'
import Instagram from 'instagram-web-api'
import FileCookieStore from 'tough-cookie-filestore2'

const { username, password } = process.env
const cookieStore = new FileCookieStore('./cookies.json')

export default class Intagram {
    constructor() {
        this.client = new Instagram({ username, password, cookieStore })
    }

    async login() {
        await this.client.login()
    }

    async uploadPost({ post, image }) {
        const { media } = await this.client.uploadPhoto({ photo: image, caption: post, post: 'feed' })
        return media
    }
}