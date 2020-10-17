import Vue from 'vue';
import VueRouter from 'vue-router';
import Start from '../views/Start.vue';
import PageNotFound from '../views/PageNotFound.vue';
import Run from '../views/Run.vue';

const About = () => import(/* webpackChunkName: "about" */ '../views/About.vue');
const Contribute = () => import(/* webpackChunkName: "contribute" */ '../views/Contribute.vue');

Vue.use(VueRouter);

const routes = [
  {
    path: '/',
    name: 'Start',
    component: Start,
    meta: { title: 'CodeRush' },
  },
  {
    path: '/about',
    name: 'About',
    component: About,
    meta: { title: 'About - CodeRush' },

  },
  {
    path: '/run',
    name: 'Run',
    component: Run,
    alias: '/results',
    meta: { title: 'Test in progress - CodeRush' },
  },
  {
    path: '/contribute',
    name: 'Contribute',
    component: Contribute,
    meta: { title: 'CodeRush - Contribute' },
  },
  {
    path: '/join/:roomName',
    component: Start,
  },
  {
    path: '*',
    component: PageNotFound,
  },
];

const router = new VueRouter({
  mode: 'history',
  routes,
});

// dynamic titles
router.beforeEach((to, from, next) => {
  let title = to.meta.title || 'CodeRush';
  if (to.path === '/results') {
    title = 'Test results - CodeRush';
  }
  document.title = title;
  next();
});

export default router;
