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
  },
  {
    path: '/about',
    name: 'About',
    component: About,
  },
  {
    path: '/run',
    name: 'Run',
    component: Run,
    alias: '/results',
  },
  {
    path: '/contribute',
    name: 'Contribute',
    component: Contribute,
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

export default router;
