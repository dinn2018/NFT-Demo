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
						style="margin-left: 16px"
					/>
				</div>
			</a-form-item>
		</a-form>
	</div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import { arcade } from '@/factories'
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

	async mounted() {
		const total = await arcade.totalSupply()
		for (let i = 0; i < total.toNumber(); i++) {
			const tokenId = await arcade.tokenByIndex(i)
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
