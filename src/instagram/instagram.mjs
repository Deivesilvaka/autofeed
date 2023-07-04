import 'dotenv/config'
import Instagram from 'instagram-publisher'
import download from 'image-downloader'
import { join } from 'path'

const { INSTAGRAM_USERNAME, INSTAGRAM_PASSWORD } = process.env

export default class Intagram {
    constructor() {
        this.client = undefined
    }

    async login() {
        this.client = new Instagram({ email: INSTAGRAM_USERNAME, password: INSTAGRAM_PASSWORD, verbose: true })
    }

    async uploadPost({ post, image }) {
        const imageDest = join(process.cwd(), 'src', 'imgs', 'photo.jpg')
        await download.image({
            url: image,
            dest: imageDest
        })
        
        const post_published = await this.client.createSingleImage({
            image_path: imageDest,
            caption: post
        })


        return post_published
    }
}