import { createRouter, createWebHistory } from 'vue-router'
import AreaSelectionView from '../views/AreaSelectionView.vue'
import WallSelectionView from '../views/WallSelectionView.vue'
import RouteDetailView from '../views/RouteDetailView.vue'
import AdminWallEditorView from '../views/AdminWallEditorView.vue'
import AdminRouteEditorView from '../views/AdminRouteEditorView.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'area-selection',
      component: AreaSelectionView
    },
    {
      path: '/area/:areaId',
      name: 'wall-selection',
      component: WallSelectionView
    },
    {
      path: '/area/:areaId/wall/:wallId/route/:routeId',
      name: 'route-detail',
      component: RouteDetailView
    },
    {
      path: '/admin/area/:areaId/wall/new',
      name: 'admin-wall-new',
      component: AdminWallEditorView
    },
    {
      path: '/admin/area/:areaId/wall/:wallId/edit',
      name: 'admin-wall-edit',
      component: AdminWallEditorView
    },
    {
      path: '/admin/area/:areaId/wall/:wallId/route/new',
      name: 'admin-route-new',
      component: AdminRouteEditorView
    },
    {
      path: '/admin/area/:areaId/wall/:wallId/route/:routeId/edit',
      name: 'admin-route-edit',
      component: AdminRouteEditorView
    }
  ]
})

export default router

