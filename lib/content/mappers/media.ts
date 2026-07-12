import type {
  MediaItemRow,
  PerformanceRow,
  ContactMethodRow,
  PlatformAccountRow,
  ThoughtQaRow,
  NotificationRow,
  ValueRow,
} from '@/types/database';
import { sortByOrder, valuesByType, dedupeBy } from './utils';

// Keys used to identify a media row by its business content (excluding
// id/profile_id/sort_order/link/comment/image_url which are either metadata
// or free-form). Keeping these in sync with what the mutation layer treats as
// "the same row" ensures the read path agrees with the write path.
const MEDIA_ROW_KEYS = ['domain', 'item_type', 'name', 'creator', 'album', 'country_or_region'] as const;

export function mapMedia(mediaItems: MediaItemRow[]) {
  const mediaBy = (domain: MediaItemRow['domain'], itemType: string) =>
    sortByOrder(
      dedupeBy(
        mediaItems.filter((item) => item.domain === domain && item.item_type === itemType),
        MEDIA_ROW_KEYS as unknown as (keyof MediaItemRow)[]
      )
    );

  return {
    reading: {
      books: mediaBy('reading', 'book').map((item) => ({
        name: item.name,
        author: item.creator,
        country: item.country_or_region,
        link: item.link,
        comment: item.comment,
      })),
      authors: mediaBy('reading', 'author').map((item) => ({
        name: item.name,
        country: item.country_or_region,
        link: item.link,
        comment: item.comment,
      })),
    },
    films: {
      films: mediaBy('films', 'film').map((item) => ({
        name: item.name,
        director: item.creator,
        country: item.country_or_region,
        link: item.link,
        comment: item.comment,
      })),
      directors: mediaBy('films', 'director').map((item) => ({
        name: item.name,
        country: item.country_or_region,
        link: item.link,
        comment: item.comment,
      })),
    },
    music: {
      albums: mediaBy('music', 'album').map((item) => ({
        name: item.name,
        artist: item.creator,
        link: item.link,
        comment: item.comment,
      })),
      songs: mediaBy('music', 'song').map((item) => ({
        name: item.name,
        artist: item.creator,
        album: item.album,
        link: item.link,
        comment: item.comment,
      })),
      musicians: mediaBy('music', 'musician').map((item) => ({
        name: item.name,
        region: item.country_or_region,
        link: item.link,
        comment: item.comment,
      })),
    },
    hiphop: {
      albums: mediaBy('hiphop', 'album').map((item) => ({
        name: item.name,
        artist: item.creator,
        link: item.link,
        comment: item.comment,
      })),
      songs: mediaBy('hiphop', 'song').map((item) => ({
        name: item.name,
        artist: item.creator,
        album: item.album,
        link: item.link,
        comment: item.comment,
      })),
      musicians: mediaBy('hiphop', 'musician').map((item) => ({
        name: item.name,
        region: item.country_or_region,
        link: item.link,
        comment: item.comment,
      })),
    },
  };
}

export function mapEvents(performances: PerformanceRow[]) {
  return {
    performances: sortByOrder(performances).map((item) => ({
      type: item.event_type,
      name: item.name,
      date: item.event_date,
      genre: item.genre,
      location: item.location,
    })),
  };
}

export function mapContact(contactMethods: ContactMethodRow[], platformAccounts: PlatformAccountRow[]) {
  return {
    contact_info: sortByOrder(contactMethods).map((item) => ({
      method_name: item.method_name,
      content: item.content,
    })),
    platform_accounts: sortByOrder(platformAccounts).map((item) => ({
      platform_name: item.platform_name,
      username: item.username,
      homepage_link: item.homepage_link,
    })),
  };
}

export function mapThoughts(listItems: (ValueRow & { list_type: string })[], thoughtQa: ThoughtQaRow[]) {
  return {
    personal_philosophy: valuesByType(listItems, 'personal_philosophy'),
    industry_views: valuesByType(listItems, 'industry_view'),
    ideology: valuesByType(listItems, 'ideology'),
    life_elements: valuesByType(listItems, 'life_element'),
    macro_vision: valuesByType(listItems, 'macro_vision'),
    personal_vision: valuesByType(listItems, 'personal_vision'),
    qa: sortByOrder(thoughtQa).map((item) => ({
      question: item.question,
      answer: item.answer,
      source: item.source,
      date: item.qa_date,
    })),
  };
}

export function mapNotifications(notifications: NotificationRow[]) {
  return [...notifications]
    .sort((a, b) => (b.notification_date ?? '').localeCompare(a.notification_date ?? ''))
    .map((item) => ({
      date: item.notification_date,
      text: item.text,
      type: item.type,
    }));
}
