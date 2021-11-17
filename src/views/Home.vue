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
				:label="`All your NFTs(${nfts.length}).`"
				style="width: 100%"
			>
				<div class="nft-display">
					<NFT
						v-for="(token, i) in nfts"
						:key="`my-${i}`"
						id-prefix="my"
						:token="token"
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
import NFT from '@/components/NFT.vue'

@Component({
	components: {
		NFT,
	},
})
export default class Home extends Vue {
	loading = false
	nfts: Entity.NFT[] = []

	async mounted() {
		await this.getMyNFTs()
	}

	async mint() {
		try {
			this.loading = true
			const signer = provider.getSigner()
			const from = await signer.getAddress()
			const data = arcade.interface.encodeFunctionData('mint')
			const tx = await signer.sendTransaction({ from, to: arcadeAddress, data })
			const receipts = await tx.wait()
			console.log(receipts)
			await this.getMyNFTs()
		} catch (e) {
			this.popError(e)
		} finally {
			this.loading = false
		}
	}

	async getMyNFTs() {
		const from = await provider.getSigner().getAddress()
		const total = await arcade.balanceOf(from)
		for (let i = 0; i < total.toNumber(); i++) {
			const tokenId = await arcade.tokenOfOwnerByIndex(from, i)
			const metaId = await arcade.metaIds(tokenId)
			const owner = await arcade.ownerOf(tokenId)
			const filters = this.nfts.filter((v) => {
				return v.metaId.toString() == metaId.toString()
			})
			if (filters.length == 0) {
				this.nfts.push({
					owner,
					tokenId,
					metaId,
				})
			}
		}
	}
}
</script>

<style></style>
