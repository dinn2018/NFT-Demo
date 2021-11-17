<template>
	<div style="width: 100%">
		<a-form>
			<a-form-item :label="`All NFTs(${nfts.length}).`">
				<div class="nft-display">
					<NFT
						v-for="(token, i) in nfts"
						:key="`all-${i}`"
						id-prefix="all"
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
import { Component, Vue, Watch } from 'vue-property-decorator'
import { arcade } from '@/factories'
import { Route } from 'vue-router'
import NFT from '@/components/NFT.vue'

@Component({
	components: {
		NFT,
	},
})
export default class All extends Vue {
	loading = false
	hasNFT = false
	nfts: Entity.NFT[] = []
	nftSize: Entity.ImageSize = {
		width: 440,
		height: 400,
	}

	@Watch('$route')
	onRouteChanged(newRoute: Route) {
		if (newRoute.name == 'all') {
			this.getAllNFTs()
		}
	}

	async created() {
		await this.getAllNFTs()
	}

	async getAllNFTs() {
		const total = await arcade.totalSupply()
		const promises: Promise<any>[] = []
		for (let i = 0; i < total.toNumber(); i++) {
			promises.push(this.getNFT(i))
		}
		await Promise.all(promises)
	}

	async getNFT(i: number) {
		const ps: Promise<any>[] = []
		const tokenId = await arcade.tokenByIndex(i)
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
