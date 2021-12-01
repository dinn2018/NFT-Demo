<template>
	<div>
		<a-card
			:id="canvsId"
			:loading="loading"
			:style="style"
		/>
		<p style="line-height: 1.2">
			owner:{{ owner }}<br>
			token id:{{ tokenId }}<br>
			meta id:{{ metaId }}
		</p>
		<a-button
			type="primary"
			@click="download"
		>
			Download
		</a-button>
	</div>
</template>

<script lang="ts">
import { BigNumber } from 'ethers'
import { Component, Prop, Vue, Watch } from 'vue-property-decorator'
import axios from 'axios'

@Component
export default class NTF extends Vue {
	canvas!: HTMLCanvasElement
	loading = false

	@Prop()
	size!: Entity.ImageSize

	@Prop()
	idPrefix!: string

	@Prop()
	token!: Entity.NFT

	wfactor = 1.0
	hfactor = 1.0

	@Watch('token')
	async onMetaIdChanged(token: Entity.NFT) {
		await this.drawNFT()
	}

	async mounted() {
		await this.drawNFT()
	}

	get style() {
		return `postion:relative; top:0; left:0; width:${this.size.width}px;height:${this.size.height}px;`
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
		this.loading = true
		this.getCanvas()
		const ctx = this.canvas.getContext('2d')!
		for (let i = 0; i < 8; i++) {
			await this.drawImage(ctx, i)
		}
		const card = document.getElementById(this.canvsId)!
		card.appendChild(this.canvas)
		this.loading = false

		// const link = document.createElement('a')
		// link.download = this.token.tokenId.toString()
		// link.href = this.canvas.toDataURL()
		// link.click()
	}

	async drawImage(ctx: CanvasRenderingContext2D, attributeTag: number) {
		const attribute = this.attributes(attributeTag)
		const attributeImage = await this.getImage(
			ctx,
			`/${attributeTag}/${attribute}`
		)
		ctx.drawImage(attributeImage, 0, 0, this.size.width, this.size.height)
	}

	async drawAttribute(
		ctx: CanvasRenderingContext2D,
		attributeTag: number,
		yOffset: (imageHeight: number) => number
	): Promise<Entity.ImageSize> {
		const attribute = this.attributes(attributeTag)
		const attributeImage = await this.getImage(
			ctx,
			`/${attributeTag}/${attribute}`
		)
		const attributeImageSize: Entity.ImageSize = {
			width: attributeImage.width * this.wfactor,
			height: attributeImage.height * this.hfactor,
		}
		ctx.drawImage(
			attributeImage,
			(this.size.width - attributeImageSize.width) / 2,
			yOffset(attributeImageSize.height),
			attributeImageSize.width,
			attributeImageSize.height
		)
		return attributeImageSize
	}

	attributes(tag: number): number {
		return this.token.metaId
			.and(BigNumber.from('0x0F').shl(8 * tag))
			.shr(8 * tag)
			.toNumber()
	}

	async getImage(
		ctx: CanvasRenderingContext2D,
		imageURI: string
	): Promise<HTMLImageElement> {
		const baseURL =
			'https://mygateway.mypinata.cloud/ipfs/QmPrKVbQKQKhrg7CLgUkQwzzWRjrXvKbjTbnPJTVQW7Fnq'
		const res = await axios.get(baseURL + imageURI)
		const image = new Image()
		image.src = res.data
		return new Promise((resolve) => {
			image.onload = () => {
				resolve(image)
			}
		})
	}

	getCanvas() {
		if (!this.canvas) {
			this.canvas = document.createElement('canvas')
			// this.canvas = document.getElementById(this.canvsId)! as HTMLCanvasElement
			this.canvas.width = this.size.width
			this.canvas.height = this.size.height
		}
	}

	async download() {
		const link = document.createElement('a')
		link.download = this.token.tokenId.toString()
		link.href = this.canvas.toDataURL()
		link.click()
	}
}
</script>
