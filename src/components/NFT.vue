<template>
	<div>
		<div
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

	@Watch('token')
	async onMetaIdChanged(token: Entity.NFT) {
		await this.drawNFT()
	}

	async mounted() {
		await this.drawNFT()
	}

	get style() {
		return `width:${this.size.width}px;height:${this.size.height}px;`
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
		//remove boder
		const borderwidth = 1
		ctx.clearRect(0, 0, borderwidth, this.size.height)
		ctx.clearRect(0, 0, this.size.width, borderwidth)
		ctx.clearRect(
			0,
			this.size.height - borderwidth,
			this.size.width,
			borderwidth
		)
		ctx.clearRect(
			this.size.width - borderwidth,
			0,
			borderwidth,
			this.size.height
		)
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
			'https://mygateway.mypinata.cloud/ipfs/QmdzAFKZFyw2WVPiYDo97E9kCzEnPRP6CdeCiuiLdiGJ2S'
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
