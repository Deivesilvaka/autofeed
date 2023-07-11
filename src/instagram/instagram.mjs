import 'dotenv/config'
import InstagramPublisher from 'instagram-publisher'
import download from 'image-downloader'
import { join } from 'path'
import fs from 'fs'
import { promisify } from 'util'
const unlink = promisify(fs.unlink)

const { INSTAGRAM_USERNAME, INSTAGRAM_PASSWORD } = process.env

export default class Instagram {
    constructor() {
        this.client = undefined
    }

    async login() {
        this.client = new InstagramPublisher({ email: INSTAGRAM_USERNAME, password: INSTAGRAM_PASSWORD, verbose: true })
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

        await unlink(imageDest)

        return post_published
    }
}