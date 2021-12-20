<template>
	<div style="width: 100%">
		<a-form>
			<a-form-item :label="`All NFTs(${total}).`">
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
			<a-pagination
				v-if="total > 0"
				v-model="page"
				style="margin-bottom: 16px"
				show-less-items
				:total="total"
				:page-size.sync="pageSize"
				@change="onPageChange"
			/>
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
	pageSize = 10
	page = 1
	total = 0
	nfts: Entity.NFT[] = []
	nftSize: Entity.ImageSize = {
		width: 400,
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

	onPageChange(page: number) {
		this.page = page
		this.getAllNFTs()
	}

	async getAllNFTs() {
		const total = await arcade.totalSupply()
		this.total = total.toNumber()
		const pageSize = this.pageSize
		const offset = (this.page - 1) * pageSize
		const end = Math.min(offset + this.pageSize, this.total)
		const promises = []
		for (let i = offset; i < end; i++) {
			promises.push(this.addNFT(i))
		}
		await Promise.all(promises)
	}

	async addNFT(i: number) {
		this.nfts = []
		const ps: Promise<any>[] = []
		const tokenId = await arcade.tokenByIndex(i)
		ps.push(arcade.metaIds(tokenId))
		ps.push(arcade.ownerOf(tokenId))
		const [metaId, owner] = await Promise.all(ps)
		this.nfts.push({
			owner,
			tokenId,
			metaId,
		})
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
