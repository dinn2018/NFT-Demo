<template>
	<div style="width: 100%">
		<a-form>
			<a-form-item label="Mint your NFT">
				<a-button
					type="primary"
					:loading="loading"
					@click="mint"
				>
					Mint
				</a-button>
			</a-form-item>
			<a-form-item
				:label="`Your NFTs(${nfts.length}).`"
				style="width: 100%"
			>
				<div class="nft-display">
					<NFT
						v-for="(token, i) in nfts"
						:key="`my-${i}`"
						id-prefix="my"
						:token="token"
						:size="nftSize"
						style="margin-left: 16px"
					/>
				</div>
			</a-form-item>
		</a-form>
	</div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import { arcadeAddress, arcade, provider } from '@/factories'
import { BigNumber } from 'ethers'
import NFT from '@/components/NFT.vue'

@Component({
	components: {
		NFT,
	},
})
export default class Home extends Vue {
	loading = false
	nfts: Entity.NFT[] = []
	nftSize: Entity.ImageSize = {
		width: 400,
		height: 400,
	}

	async created() {
		await this.getMyNFTs()
	}

	async mint() {
		try {
			this.loading = true
			const signer = provider.getSigner()
			const from = await signer.getAddress()
			const isWhiteAllowed = await arcade.isWhiteAllowed(from)
			const isWhiteMinted = await arcade.isWhiteMinted(from)
			const isWhiteOpen = await arcade.isWhiteOpen()
			let data: string
			if (isWhiteOpen && isWhiteAllowed && !isWhiteMinted) {
				data = arcade.interface.encodeFunctionData('whiteMint', [from])
			} else {
				data = arcade.interface.encodeFunctionData('mint', [from])
			}
			const tx = await signer.sendTransaction({
				from,
				to: arcadeAddress,
				data,
				value: BigNumber.from((8e16).toString()),
			})
			await tx.wait()
			this.getMyNFTs()
		} catch (e) {
			this.popError(e)
		} finally {
			this.loading = false
		}
	}

	async getMyNFTs() {
		const from = await provider.getSigner().getAddress()
		const total = await arcade.balanceOf(from)
		const promises = []
		for (let i = 0; i < total.toNumber(); i++) {
			promises.push(this.getNFT(from, i))
		}
		await Promise.all(promises)
	}

	async getNFT(from: string, i: number) {
		const ps: Promise<any>[] = []
		const tokenId = await arcade.tokenOfOwnerByIndex(from, i)
		const filters = this.nfts.filter((v) => {
			return v.tokenId.toString() == tokenId.toString()
		})
		if (filters.length != 0) {
			return
		}
		ps.push(arcade.metaIds(tokenId))
		ps.push(arcade.ownerOf(tokenId))
		const [metaId, owner] = await Promise.all(ps)
		this.nfts.push({
			owner,
			tokenId,
			metaId,
		})
	}
}
</script>

<style></style>
