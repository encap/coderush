import Vue from 'vue';
import VueRouter from 'vue-router';
import Start from '../views/Start.vue';
import About from '../views/About.vue';
import Run from '../views/Run.vue';
import MyUniverse from '../views/MyUniverse.vue';
import Contribute from '../views/Contribute.vue';
import PageNotFound from '../views/PageNotFound.vue';

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
    path: '/myuniverse',
    name: 'MyUniverse',
    component: MyUniverse,
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
  base: process.env.BASE_URL,
  routes,
});

export default router;
