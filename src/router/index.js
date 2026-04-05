import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    redirect: '/map/theme'
  },
  // MapTab - 6단계 흐름
  {
    path: '/map/theme',
    name: 'ThemeSetup',
    component: () => import('@/views/MapTab/1_ThemeSetupView.vue')
  },
  {
    path: '/map/preview',
    name: 'AiRoutePreview',
    component: () => import('@/views/MapTab/2_AiRoutePreviewView.vue')
  },
  {
    path: '/map/station',
    name: 'StationSelect',
    component: () => import('@/views/MapTab/3_StationSelectView.vue')
  },
  {
    path: '/map/riding',
    name: 'ActiveRiding',
    component: () => import('@/views/MapTab/4_ActiveRidingView.vue')
  },
  {
    path: '/map/return',
    name: 'ReturnGuide',
    component: () => import('@/views/MapTab/5_ReturnGuideView.vue')
  },
  {
    path: '/map/result',
    name: 'Result',
    component: () => import('@/views/MapTab/6_ResultView.vue')
  },
  // HistoryTab
  {
    path: '/history',
    name: 'History',
    component: () => import('@/views/HistoryTab/HistoryListView.vue')
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
