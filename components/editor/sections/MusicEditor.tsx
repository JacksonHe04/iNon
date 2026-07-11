'use client';

import { useState } from 'react';
import type { ReadmeData } from '@/types';
import EditorSectionCard from '../EditorSectionCard';
import { ObjectArrayEditor } from '../EditorControls';
import { useSectionSave } from '../hooks/useSectionSave';
import { Music } from 'lucide-react';

export default function MusicEditor({ initialData }: { initialData: ReadmeData }) {
  const [music, setMusic] = useState(initialData.music);
  const [hiphop, setHiphop] = useState(initialData.hiphop);
  const [currentSubTab, setCurrentSubTab] = useState<'music' | 'hiphop'>('music');

  const { saveStatus: saveStatusMusic, errorMessage: errorMusic, saveSection: saveMusic } = useSectionSave('music');
  const { saveStatus: saveStatusHiphop, errorMessage: errorHiphop, saveSection: saveHiphop } = useSectionSave('hiphop');

  const handleSave = () => {
    if (currentSubTab === 'music') {
      saveMusic(music);
    } else {
      saveHiphop(hiphop);
    }
  };

  const currentData = currentSubTab === 'music' ? music : hiphop;
  const setCurrentData = (next: any) => {
    if (currentSubTab === 'music') {
      setMusic(next);
    } else {
      setHiphop(next);
    }
  };

  return (
    <EditorSectionCard
      title="11. 音乐与 HipHop (Music)"
      description="管理歌曲库、最爱专辑、音乐人及 HipHop 文化推荐"
      icon={Music}
      saveStatus={currentSubTab === 'music' ? saveStatusMusic : saveStatusHiphop}
      errorMessage={currentSubTab === 'music' ? errorMusic : errorHiphop}
      onSave={handleSave}
    >
      <div className="flex items-center gap-2 border-b border-white/10 pb-3">
        <button
          type="button"
          onClick={() => setCurrentSubTab('music')}
          className={`px-4 py-1.5 rounded-xl text-xs font-bold transition ${
            currentSubTab === 'music'
              ? 'bg-pink-500 text-white shadow'
              : 'bg-white/20 text-gray-700 dark:text-gray-300 hover:bg-white/30'
          }`}
        >
          流行 / 综合音乐 (Music)
        </button>
        <button
          type="button"
          onClick={() => setCurrentSubTab('hiphop')}
          className={`px-4 py-1.5 rounded-xl text-xs font-bold transition ${
            currentSubTab === 'hiphop'
              ? 'bg-yellow-500 text-black shadow'
              : 'bg-white/20 text-gray-700 dark:text-gray-300 hover:bg-white/30'
          }`}
        >
          嘻哈与黑胶 (HipHop)
        </button>
      </div>

      <ObjectArrayEditor
        title="单曲 / 歌曲 Songs"
        items={currentData.songs}
        onChange={(next) => setCurrentData({ ...currentData, songs: next })}
        createItem={() => ({ name: '', artist: '', album: '', link: '', comment: '', image_url: '' })}
        getItemTitle={(item) => `${item.name || '歌名'} — ${item.artist || '歌手'}`}
        fields={[
          { key: 'name', label: '歌曲名称' },
          { key: 'artist', label: '演唱 / 制作人' },
          { key: 'album', label: '所属专辑' },
          { key: 'link', label: '网易云 / Spotify 链接' },
          { key: 'comment', label: '推荐评语', type: 'textarea' },
          { key: 'image_url', label: '歌曲封面 URL', type: 'image' },
        ]}
      />

      <div className="border-t border-white/10 pt-4">
        <ObjectArrayEditor
          title="专辑 Albums"
          items={currentData.albums}
          onChange={(next) => setCurrentData({ ...currentData, albums: next })}
          createItem={() => ({ name: '', artist: '', link: '', comment: '', image_url: '' })}
          getItemTitle={(item) => `${item.name || '专辑名'} — ${item.artist || '艺人'}`}
          fields={[
            { key: 'name', label: '专辑名称' },
            { key: 'artist', label: '艺人 / 乐队' },
            { key: 'link', label: '专辑链接' },
            { key: 'comment', label: '推荐评语', type: 'textarea' },
            { key: 'image_url', label: '专辑封面 URL', type: 'image' },
          ]}
        />
      </div>

      <div className="border-t border-white/10 pt-4">
        <ObjectArrayEditor
          title="音乐人 / 厂牌 Musicians"
          items={currentData.musicians}
          onChange={(next) => setCurrentData({ ...currentData, musicians: next })}
          createItem={() => ({ name: '', region: '', link: '', comment: '', image_url: '' })}
          getItemTitle={(item) => item.name || '音乐人'}
          fields={[
            { key: 'name', label: '音乐人 / 厂牌名称' },
            { key: 'region', label: '地区 / 风格' },
            { key: 'link', label: '主页链接' },
            { key: 'comment', label: '评价', type: 'textarea' },
            { key: 'image_url', label: '音乐人图片 URL', type: 'image' },
          ]}
        />
      </div>
    </EditorSectionCard>
  );
}
