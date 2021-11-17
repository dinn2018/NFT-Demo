<template>
	<div>
		<canvas :id="canvsId" />
		<p style="line-height: 1.2">
			owner:{{ owner }}<br>
			token id:{{ tokenId }}<br>
			meta id:{{ metaId }}
		</p>
	</div>
</template>

<script lang="ts">
import { BigNumber } from 'ethers'
import { Component, Prop, Vue, Watch } from 'vue-property-decorator'
import axios from 'axios'

@Component
export default class NTF extends Vue {
	canvas!: HTMLCanvasElement

	@Prop()
	idPrefix!: string

	@Prop()
	token!: Entity.NFT

	@Watch('token')
	async onMetaIdChanged(token: Entity.NFT) {
		await this.drawNFT()
	}

	mounted() {
		this.drawNFT()
	}

	get canvsId() {
		return `${this.idPrefix}-${this.metaId}`
	}

	get owner() {
		return this.token.owner
	}

	get tokenId() {
		return this.token.tokenId.toNumber()
	}

	get metaId() {
		return this.token.metaId.toHexString()
	}

	async drawNFT() {
		console.log('drawNFT')
		const level = this.attributes(0)
		const armor = this.attributes(1)
		const gem = this.attributes(2)
		const earmuff = this.attributes(3)
		const mask = this.attributes(4)
		const glass = this.attributes(5)
		const width = 220
		const height = 200
		this.getCanvas(width, height)
		const ctx = this.canvas.getContext('2d')!
		// base
		await this.drawImage(ctx, `/0/${level}`, 0, 0, width, height)
		// armor
		await this.drawImage(
			ctx,
			`/1/${armor}`,
			0,
			0.66 * height,
			width,
			0.34 * height
		)
		// gem
		await this.drawImage(
			ctx,
			`/2/${gem}`,
			0.43 * width,
			0.84 * height,
			0.139 * width,
			0.12 * height
		)
		// earmuff
		await this.drawImage(
			ctx,
			`/3/${earmuff}`,
			0.21 * width,
			0.28 * height,
			0.58 * width,
			0.2 * height
		)
		// mask
		await this.drawImage(
			ctx,
			`/4/${mask}`,
			0.295 * width,
			0.44 * height,
			0.41 * width,
			0.28 * height
		)
		// glass
		await this.drawImage(
			ctx,
			`/5/${glass}`,
			0.273 * width,
			0.26 * height,
			0.453 * width,
			0.2 * height
		)
	}

	attributes(tag: number): number {
		return this.token.metaId
			.and(BigNumber.from('0x0F').shl(8 * tag))
			.shr(8 * tag)
			.toNumber()
	}

	async drawImage(
		ctx: CanvasRenderingContext2D,
		imageURI: string,
		x: number,
		y: number,
		w: number,
		h: number
	) {
		const baseURL =
			'https://mygateway.mypinata.cloud/ipfs/QmYoKkLhCbL6jMgDVXoszArr7NtpYCm5Wz24FJh5g4qoMW'
		const res = await axios.get(baseURL + imageURI)
		const image = new Image()
		image.src = res.data
		return new Promise((resolve) => {
			image.onload = () => {
				ctx.drawImage(image, x, y, w, h)
				resolve(1)
			}
		})
	}

	getCanvas(w: number, h: number) {
		if (!this.canvas) {
			// this.canvas = document.createElement('canvas')
			this.canvas = document.getElementById(this.canvsId)! as HTMLCanvasElement
			this.canvas.width = w
			this.canvas.height = h
		}
	}

	async download() {
		const link = document.createElement('a')
		link.download = 'filename.png'
		link.href = this.canvas.toDataURL()
		link.click()
	}
}
</script>
