import { BookOpen, Disc, Film } from 'lucide-react';
import type { EditorSchema } from '../types';

export const LIBRARY_EDITOR_SCHEMAS: Record<string, EditorSchema> = {
  reading: {
    id: 'reading',
    title: '9. 在读书单与作者 (Reading)',
    description: '管理在读书目、推荐书单、作者档案与读书感悟',
    icon: BookOpen,
    fields: [
      {
        key: 'books',
        label: '书籍档案 Books',
        type: 'object-array',
        createItem: () => ({ name: '', author: '', country: '', link: '', comment: '', image_url: '' }),
        getItemTitle: (item) => `${item.name || '书名'} — ${item.author || '作者'}`,
        subFields: [
          { key: 'name', label: '书名' },
          { key: 'author', label: '作者' },
          { key: 'country', label: '国家 / 地区' },
          { key: 'link', label: '豆瓣 / 购买链接' },
          { key: 'comment', label: '读书笔记与评语', type: 'textarea' },
          { key: 'image_url', label: '书籍封面 URL', type: 'image' },
        ],
      },
      {
        key: 'authors',
        label: '喜爱作者 Authors',
        type: 'object-array',
        createItem: () => ({ name: '', country: '', link: '', comment: '', image_url: '' }),
        getItemTitle: (item) => item.name || '作者姓名',
        subFields: [
          { key: 'name', label: '作者姓名' },
          { key: 'country', label: '国家 / 地区' },
          { key: 'link', label: '介绍链接' },
          { key: 'comment', label: '评价与推介', type: 'textarea' },
          { key: 'image_url', label: '作者图片 URL', type: 'image' },
        ],
      },
    ],
  },

  films: {
    id: 'films',
    title: '10. 影视海报墙与导演 (Films)',
    description: '管理看过的影片、最爱电影墙、导演档案与影评',
    icon: Film,
    fields: [
      {
        key: 'films',
        label: '电影与剧集 Films',
        type: 'object-array',
        createItem: () => ({ name: '', director: '', country: '', link: '', comment: '', image_url: '' }),
        getItemTitle: (item) => `${item.name || '片名'} — 导演: ${item.director || '未知'}`,
        subFields: [
          { key: 'name', label: '影片名称' },
          { key: 'director', label: '导演' },
          { key: 'country', label: '出品国家 / 地区' },
          { key: 'link', label: '豆瓣 / IMDb 链接' },
          { key: 'comment', label: '影评与观影感受', type: 'textarea' },
          { key: 'image_url', label: '影片封面 URL', type: 'image' },
        ],
      },
      {
        key: 'directors',
        label: '喜爱导演 Directors',
        type: 'object-array',
        createItem: () => ({ name: '', country: '', link: '', comment: '', image_url: '' }),
        getItemTitle: (item) => item.name || '导演姓名',
        subFields: [
          { key: 'name', label: '导演姓名' },
          { key: 'country', label: '国家 / 地区' },
          { key: 'link', label: '介绍链接' },
          { key: 'comment', label: '评价与推介', type: 'textarea' },
          { key: 'image_url', label: '导演图片 URL', type: 'image' },
        ],
      },
    ],
  },

  music: {
    id: 'music',
    title: '11. 喜爱音乐 (Music)',
    description: '管理常听的单曲、最爱专辑墙及喜爱音乐人',
    icon: Disc,
    fields: [
      {
        key: 'albums',
        label: '音乐专辑 Albums',
        type: 'object-array',
        createItem: () => ({ name: '', artist: '', link: '', comment: '', image_url: '' }),
        getItemTitle: (item) => `${item.name || '专辑名'} — ${item.artist || '艺人'}`,
        subFields: [
          { key: 'name', label: '专辑名称' },
          { key: 'artist', label: '艺人 / 乐队' },
          { key: 'link', label: '流媒体播放链接' },
          { key: 'comment', label: '专辑乐评', type: 'textarea' },
          { key: 'image_url', label: '专辑封面 URL', type: 'image' },
        ],
      },
      {
        key: 'songs',
        label: '喜爱单曲 Songs',
        type: 'object-array',
        createItem: () => ({ name: '', artist: '', album: '', link: '', comment: '', image_url: '' }),
        getItemTitle: (item) => `${item.name || '单曲名'} — ${item.artist || '艺人'}`,
        subFields: [
          { key: 'name', label: '歌曲名称' },
          { key: 'artist', label: '艺人 / 歌手' },
          { key: 'album', label: '所属专辑' },
          { key: 'link', label: '单曲播放链接' },
          { key: 'comment', label: '听歌感悟评语', type: 'textarea' },
          { key: 'image_url', label: '歌曲封面 URL', type: 'image' },
        ],
      },
      {
        key: 'musicians',
        label: '喜爱音乐人 Musicians',
        type: 'object-array',
        createItem: () => ({ name: '', region: '', link: '', comment: '', image_url: '' }),
        getItemTitle: (item) => item.name || '音乐人姓名',
        subFields: [
          { key: 'name', label: '音乐人 / 乐手' },
          { key: 'region', label: '地区 / 风格' },
          { key: 'link', label: '主页介绍链接' },
          { key: 'comment', label: '推介评语', type: 'textarea' },
          { key: 'image_url', label: '艺人照片 URL', type: 'image' },
        ],
      },
    ],
  },

  hiphop: {
    id: 'hiphop',
    title: '11b. 说唱说唱 (Hip Hop)',
    description: '管理 Hip Hop 单曲、最爱说唱专辑墙及说唱艺人',
    icon: Disc,
    fields: [
      {
        key: 'albums',
        label: '说唱专辑 Albums',
        type: 'object-array',
        createItem: () => ({ name: '', artist: '', link: '', comment: '', image_url: '' }),
        getItemTitle: (item) => `${item.name || '专辑名'} — ${item.artist || '歌手'}`,
        subFields: [
          { key: 'name', label: '专辑名称' },
          { key: 'artist', label: '歌手' },
          { key: 'link', label: '流媒体播放链接' },
          { key: 'comment', label: '专辑点评', type: 'textarea' },
          { key: 'image_url', label: '专辑封面 URL', type: 'image' },
        ],
      },
      {
        key: 'songs',
        label: '说唱单曲 Songs',
        type: 'object-array',
        createItem: () => ({ name: '', artist: '', album: '', link: '', comment: '', image_url: '' }),
        getItemTitle: (item) => `${item.name || '歌名'} — ${item.artist || '歌手'}`,
        subFields: [
          { key: 'name', label: '歌曲名称' },
          { key: 'artist', label: '说唱歌手' },
          { key: 'album', label: '所属专辑' },
          { key: 'link', label: '播放链接' },
          { key: 'comment', label: '单曲点评', type: 'textarea' },
          { key: 'image_url', label: '单曲封面 URL', type: 'image' },
        ],
      },
      {
        key: 'musicians',
        label: '说唱音乐人 Musicians',
        type: 'object-array',
        createItem: () => ({ name: '', region: '', link: '', comment: '', image_url: '' }),
        getItemTitle: (item) => item.name || '歌手姓名',
        subFields: [
          { key: 'name', label: '说唱艺人' },
          { key: 'region', label: '地区 / 厂牌' },
          { key: 'link', label: '介绍链接' },
          { key: 'comment', label: '推介评语', type: 'textarea' },
          { key: 'image_url', label: '歌手照片 URL', type: 'image' },
        ],
      },
    ],
  },

};
