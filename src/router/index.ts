import Vue from 'vue'
import VueRouter, { RouteConfig } from 'vue-router'
Vue.use(VueRouter)

const routes: RouteConfig[] = [
	{
		path: '/',
		name: 'home',
		component: () => import('../views/Home.vue'),
	},
	{
		path: '/all',
		name: 'all',
		component: () => import('../views/All.vue'),
	}
]

const router = new VueRouter({
	base: process.env.BASE_URL,
	routes,
})

export default router
