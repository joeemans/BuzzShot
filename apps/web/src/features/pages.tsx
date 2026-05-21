import Link from 'next/link';
import {
  Bookmark,
  CheckCircle2,
  Heart,
  ListPlus,
  Lock,
  Network,
  ShieldCheck,
  Sparkles,
  Star,
  UsersRound,
} from 'lucide-react';
import {
  FavoriteButton,
  RatingControl,
  WatchedButton,
  WatchlistButton,
} from '@/components/action-buttons';
import { AuthForm } from '@/components/auth-form';
import { ActivityFeedItem } from '@/components/activity-feed-item';
import { ButtonLink } from '@/components/button';
import { ListCard } from '@/components/list-card';
import { ListEngagement, ListItemManager, MediaListControls } from '@/components/list-actions';
import { MediaGrid } from '@/components/media-grid';
import { NewListForm } from '@/components/new-list-form';
import { MarkNotificationsReadButton } from '@/components/notification-actions';
import { PaginationControls } from '@/components/pagination-controls';
import { ProfileHeader } from '@/components/profile-header';
import { RatingStars } from '@/components/rating-stars';
import { ReviewCard } from '@/components/review-card';
import { ReviewForm } from '@/components/review-form';
import { ReviewLikeButton } from '@/components/review-actions';
import { SearchBar } from '@/components/search-bar';
import { AccountSettingsPanel, ProfileSettingsForm, SecuritySettingsForm } from '@/components/settings-forms';
import { EmptyState, ErrorState } from '@/components/states';
import {
  getCatalog,
  getCollection,
  getDetail,
  getFeed,
  getList,
  getListComments,
  getLists,
  getNotifications,
  getProfile,
  getRecommendations,
  getReview,
  getReviews,
  getSearchResults,
  getTrending,
} from '@/lib/api';
import { getCurrentUser } from '@/lib/auth-server';
import { formatDate, minutesToRuntime } from '@/lib/utils';

function SectionHeader({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        {eyebrow ? <p className="text-sm font-bold uppercase text-primary">{eyebrow}</p> : null}
        <h2 className="mt-2 text-3xl font-semibold">{title}</h2>
        {description ? <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">{description}</p> : null}
      </div>
      {action}
    </div>
  );
}

const tasteGraphNodes = [
  {
    label: 'Ratings',
    detail: '4+ star signals',
    className: 'left-[6%] top-[18%]',
    icon: Star,
    tone: 'border-primary/[0.35] text-primary',
  },
  {
    label: 'Lists',
    detail: 'Weekend queues',
    className: 'left-[42%] top-[8%]',
    icon: ListPlus,
    tone: 'border-accent/[0.35] text-accent',
  },
  {
    label: 'People',
    detail: 'Trusted follows',
    className: 'right-[5%] top-[36%]',
    icon: UsersRound,
    tone: 'border-white/[0.18] text-foreground',
  },
  {
    label: 'Reviews',
    detail: 'Spoiler-safe takes',
    className: 'left-[22%] bottom-[10%]',
    icon: Network,
    tone: 'border-primary/[0.28] text-primary',
  },
  {
    label: 'For You',
    detail: 'Reasoned picks',
    className: 'right-[18%] bottom-[13%]',
    icon: Sparkles,
    tone: 'border-accent/[0.32] text-accent',
  },
];

function TasteGraphPreview() {
  return (
    <div className="relative min-h-[18rem] overflow-hidden rounded-lg border border-white/[0.1] bg-black/[0.34] shadow-2xl shadow-black/30">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(246,192,47,0.12),transparent_12rem),radial-gradient(circle_at_75%_62%,rgba(41,203,190,0.14),transparent_13rem)]" />
      <svg
        aria-hidden="true"
        viewBox="0 0 420 288"
        preserveAspectRatio="none"
        className="absolute inset-0 h-full w-full"
      >
        <path d="M68 74 C145 22 219 29 276 106" stroke="rgba(246,192,47,0.38)" strokeWidth="2" fill="none" />
        <path d="M277 106 C220 155 180 194 112 228" stroke="rgba(41,203,190,0.34)" strokeWidth="2" fill="none" />
        <path d="M112 228 C206 254 267 241 337 217" stroke="rgba(246,192,47,0.3)" strokeWidth="2" fill="none" />
        <path d="M336 129 C328 165 329 190 337 217" stroke="rgba(255,255,255,0.22)" strokeWidth="2" fill="none" />
        <path d="M174 46 C187 105 153 169 112 228" stroke="rgba(255,255,255,0.18)" strokeWidth="2" fill="none" />
      </svg>
      {tasteGraphNodes.map((node) => (
        <div
          key={node.label}
          className={`absolute w-36 rounded-md border bg-background/[0.82] p-3 shadow-xl shadow-black/30 backdrop-blur ${node.className} ${node.tone}`}
        >
          <div className="flex items-center gap-2">
            <node.icon aria-hidden="true" className="h-4 w-4" />
            <p className="text-sm font-bold text-foreground">{node.label}</p>
          </div>
          <p className="mt-1 text-xs text-muted">{node.detail}</p>
        </div>
      ))}
    </div>
  );
}

export async function HomePage() {
  const [trending, reviews, lists] = await Promise.all([getTrending(), getReviews(), getLists()]);
  const hero = trending[0];

  return (
    <>
      <section className="relative min-h-[82vh] overflow-hidden">
        {hero?.backdropUrl ? (
          <img
            src={hero.backdropUrl}
            alt=""
            width={1920}
            height={1080}
            fetchPriority="high"
            className="absolute inset-0 h-full w-full object-cover opacity-55"
          />
        ) : null}
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-background/58 to-background" />
        <div className="section relative flex min-h-[82vh] flex-col justify-end pb-20 pt-28">
          <div className="max-w-3xl">
            <p className="text-sm font-bold uppercase text-primary">BuzzShot V2</p>
            <h1 className="mt-4 text-5xl font-black leading-tight sm:text-7xl">
              Find the next title worth arguing about.
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-foreground/82">
              Discover films and series, write sharp reviews, build public lists, follow people with taste, and get
              recommendations with reasons.
            </p>
            <div className="mt-8 max-w-2xl">
              <SearchBar />
            </div>
            <div className="mt-8 flex flex-wrap gap-3">
              <ButtonLink href="/movies">Browse movies</ButtonLink>
              <ButtonLink href="/series" variant="secondary">
                Browse series
              </ButtonLink>
            </div>
          </div>
        </div>
      </section>

      <section className="section py-12">
        <SectionHeader
          eyebrow="Discovery"
          title="Trending now"
          description="A live-ready grid backed by the API, with graceful demo data while TMDB credentials are configured."
          action={
            <ButtonLink href="/search" variant="secondary">
              Explore all
            </ButtonLink>
          }
        />
        <MediaGrid items={trending.slice(0, 10)} />
      </section>

      <section className="section py-12">
        <SectionHeader
          eyebrow="Community"
          title="Popular reviews"
          description="Short-form reactions and longer essays share the same social surface."
        />
        <div className="grid gap-4 lg:grid-cols-3">
          {reviews.slice(0, 3).map((review) => (
            <ReviewCard key={review.id} review={review} />
          ))}
        </div>
      </section>

      <section className="section py-12">
        <SectionHeader
          eyebrow="Lists"
          title="Curated by members"
          description="Public and private list mechanics are represented in the interface and API shape."
          action={
            <ButtonLink href="/lists/new" variant="secondary">
              New list
            </ButtonLink>
          }
        />
        <div className="grid gap-4 lg:grid-cols-2">
          {lists.map((list) => (
            <ListCard key={list.id} list={list} />
          ))}
        </div>
      </section>

      <section className="py-16">
        <div className="border-y border-white/[0.08] bg-[radial-gradient(circle_at_18%_0%,rgba(246,192,47,0.16),transparent_26rem),radial-gradient(circle_at_86%_72%,rgba(41,203,190,0.13),transparent_24rem),linear-gradient(135deg,rgba(9,13,22,0.98),rgba(3,6,12,0.97))]">
          <div className="section grid items-center gap-10 py-12 lg:grid-cols-[1fr_27rem]">
            <div>
              <p className="text-sm font-bold uppercase text-primary">Recommendations</p>
              <h2 className="mt-3 max-w-2xl text-4xl font-black leading-tight sm:text-5xl">
                Build your taste graph.
              </h2>
              <p className="mt-4 max-w-2xl text-base leading-7 text-foreground/[0.78]">
                Rate, review, follow, and list your way into recommendations that can explain themselves.
              </p>
              <div className="mt-6 flex flex-wrap gap-2 text-xs font-semibold text-muted">
                <span className="rounded-full border border-white/[0.1] bg-white/[0.05] px-3 py-1.5">Ratings</span>
                <span className="rounded-full border border-white/[0.1] bg-white/[0.05] px-3 py-1.5">Reviews</span>
                <span className="rounded-full border border-white/[0.1] bg-white/[0.05] px-3 py-1.5">Follows</span>
                <span className="rounded-full border border-white/[0.1] bg-white/[0.05] px-3 py-1.5">Lists</span>
              </div>
              <ButtonLink href="/register" className="mt-8 rounded-full px-5 shadow-[0_0_32px_rgba(246,192,47,0.22)]">
                <Sparkles aria-hidden="true" className="h-4 w-4" />
                Join BuzzShot
              </ButtonLink>
            </div>
            <TasteGraphPreview />
          </div>
        </div>
      </section>
    </>
  );
}

export async function CatalogPage({ mediaType }: { mediaType: 'movie' | 'series' }) {
  const items = await getCatalog(mediaType);
  const title = mediaType === 'movie' ? 'Movies' : 'Series';
  return (
    <section className="section py-12">
      <SectionHeader
        eyebrow="Browse"
        title={title}
        description={`Discover ${mediaType === 'movie' ? 'films' : 'shows'} by popularity, rating, and community momentum.`}
      />
      <MediaGrid items={items} />
      <PaginationControls />
    </section>
  );
}

export async function SearchPage({ query }: { query: string }) {
  const results = await getSearchResults(query);
  return (
    <section className="section py-12">
      <SectionHeader
        eyebrow="Search"
        title={query ? `Results for "${query}"` : 'Search BuzzShot'}
        description="Search movies, series, lists, users, and reviews from one place."
      />
      <div className="mb-8 max-w-2xl">
        <SearchBar defaultValue={query} />
      </div>
      <div className="space-y-10">
        <div>
          <SectionHeader title="Media" />
          <MediaGrid items={results.media} />
        </div>
        {results.users.length > 0 ? (
          <div>
            <SectionHeader title="People" />
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {results.users.map((user) => (
                <Link key={user.id} href={`/profile/${user.username}`} className="rounded-md border border-border bg-white/6 p-4 hover:border-primary/50">
                  <p className="font-semibold">{user.displayName}</p>
                  <p className="text-sm text-muted">@{user.username}</p>
                </Link>
              ))}
            </div>
          </div>
        ) : null}
        {results.reviews.length > 0 ? (
          <div>
            <SectionHeader title="Reviews" />
            <div className="grid gap-4 lg:grid-cols-2">
              {results.reviews.map((review) => (
                <ReviewCard key={review.id} review={review} />
              ))}
            </div>
          </div>
        ) : null}
        {results.lists.length > 0 ? (
          <div>
            <SectionHeader title="Lists" />
            <div className="grid gap-4 lg:grid-cols-2">
              {results.lists.map((list) => (
                <ListCard key={list.id} list={list} />
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}

export async function DetailPage({ mediaType, tmdbId }: { mediaType: 'movie' | 'series'; tmdbId: number }) {
  const [detail, reviews] = await Promise.all([getDetail(mediaType, tmdbId), getReviews()]);

  if (!detail) {
    return (
      <section className="section py-12">
        <ErrorState title="Title not found" description="The requested media item is not available yet." />
      </section>
    );
  }

  const runtime = detail.mediaType === 'movie' ? minutesToRuntime(detail.runtimeMinutes) : `${detail.seasons} seasons`;
  const mediaReviews = reviews.filter((review) => review.media.tmdbId === detail.tmdbId);

  return (
    <>
      <section className="relative overflow-hidden">
        {detail.backdropUrl ? (
          <img
            src={detail.backdropUrl}
            alt=""
            width={1920}
            height={1080}
            fetchPriority="high"
            className="absolute inset-0 h-full w-full object-cover opacity-45"
          />
        ) : null}
        <div className="absolute inset-0 bg-gradient-to-b from-black/25 via-background/70 to-background" />
        <div className="section relative grid min-h-[72vh] items-end gap-8 pb-12 pt-28 lg:grid-cols-[260px_1fr]">
          <img
            src={detail.posterUrl ?? ''}
            alt=""
            width={260}
            height={390}
            className="hidden aspect-[2/3] rounded-md border border-border object-cover shadow-2xl lg:block"
          />
          <div>
            <p className="text-sm font-bold uppercase text-primary">{detail.mediaType}</p>
            <h1 className="mt-3 text-5xl font-black leading-tight sm:text-7xl">{detail.title}</h1>
            <p className="mt-5 max-w-3xl text-lg leading-8 text-foreground/82">{detail.overview}</p>
            <div className="mt-5 flex flex-wrap items-center gap-3 text-sm text-muted">
              <span>{formatDate(detail.releaseDate)}</span>
              <span>{runtime}</span>
              <span>{detail.status}</span>
              <RatingStars value={detail.buzzScore / 2} />
            </div>
            <div className="mt-5 flex flex-wrap gap-2">
              {detail.genres.map((genre) => (
                <span key={genre} className="rounded bg-white/10 px-3 py-1 text-xs font-semibold">
                  {genre}
                </span>
              ))}
            </div>
            <div className="mt-8 flex flex-wrap gap-3">
              <WatchlistButton
                mediaType={detail.mediaType}
                tmdbId={detail.tmdbId}
                initialActive={detail.viewer?.inWatchlist ?? false}
              />
              <WatchedButton
                mediaType={detail.mediaType}
                tmdbId={detail.tmdbId}
                initialActive={detail.viewer?.watched ?? false}
              />
              <FavoriteButton
                mediaType={detail.mediaType}
                tmdbId={detail.tmdbId}
                initialActive={detail.viewer?.favorite ?? false}
              />
              {detail.trailerUrl ? (
                <ButtonLink href={detail.trailerUrl} variant="secondary">
                  Trailer
                </ButtonLink>
              ) : null}
            </div>
          </div>
        </div>
      </section>

      <section className="section grid gap-8 py-12 lg:grid-cols-[1fr_360px]">
        <div className="space-y-10">
          <div>
            <SectionHeader title="Cast" />
            <div className="grid gap-3 sm:grid-cols-3">
              {detail.cast.map((member) => (
                <div key={member.id} className="rounded-md border border-border bg-white/6 p-4">
                  <img
                    src={member.avatarUrl ?? ''}
                    alt=""
                    width={48}
                    height={48}
                    loading="lazy"
                    className="h-12 w-12 rounded-md"
                  />
                  <p className="mt-3 font-semibold">{member.name}</p>
                  <p className="text-sm text-muted">{member.character}</p>
                </div>
              ))}
            </div>
          </div>

          <div>
            <SectionHeader title="Reviews" />
            <div className="space-y-4">
              {mediaReviews.length > 0 ? (
                mediaReviews.map((review) => <ReviewCard key={review.id} review={review} />)
              ) : (
                <EmptyState title="No reviews yet" description="Be the first to write something useful." />
              )}
            </div>
          </div>

          <div>
            <SectionHeader title="Similar titles" />
            <MediaGrid items={detail.similar} />
          </div>
        </div>

        <aside className="space-y-6">
          <div className="rounded-md border border-border bg-white/6 p-5">
            <h2 className="text-xl font-semibold">Your rating</h2>
            <div className="mt-4">
              <RatingControl mediaType={detail.mediaType} tmdbId={detail.tmdbId} initialRating={detail.viewer?.rating ?? 0} />
            </div>
          </div>
          <ReviewForm mediaType={detail.mediaType} tmdbId={detail.tmdbId} />
          <MediaListControls
            mediaType={detail.mediaType}
            tmdbId={detail.tmdbId}
            lists={detail.viewer?.lists ?? []}
          />
          <div className="rounded-md border border-border bg-white/6 p-5">
            <h2 className="text-xl font-semibold">Recommended next</h2>
            <div className="mt-4 space-y-3">
              {detail.recommendations.map((item) => (
                <Link
                  key={`${item.media.mediaType}-${item.media.tmdbId}`}
                  href={`/${item.media.mediaType === 'movie' ? 'movie' : 'series'}/${item.media.tmdbId}`}
                  className="block rounded border border-border bg-black/25 p-3 hover:border-primary/50"
                >
                  <p className="font-semibold">{item.media.title}</p>
                  <p className="mt-1 text-xs leading-5 text-muted">{item.reason}</p>
                </Link>
              ))}
            </div>
          </div>
        </aside>
      </section>
    </>
  );
}

export async function ProfilePage({ username }: { username: string }) {
  const [profile, reviews, lists] = await Promise.all([getProfile(username), getReviews(), getLists()]);
  if (!profile) {
    return (
      <section className="section py-12">
        <ErrorState title="Profile not found" description="This BuzzShot profile does not exist." />
      </section>
    );
  }
  return (
    <section className="section space-y-10 py-12">
      <ProfileHeader profile={profile} />
      <div>
        <SectionHeader title="Recent reviews" />
        <div className="grid gap-4 lg:grid-cols-2">
          {reviews
            .filter((review) => review.user.username === username)
            .map((review) => (
              <ReviewCard key={review.id} review={review} />
            ))}
        </div>
      </div>
      <div>
        <SectionHeader title="Lists" />
        <div className="grid gap-4 lg:grid-cols-2">
          {lists
            .filter((list) => list.owner.username === username)
            .map((list) => (
              <ListCard key={list.id} list={list} />
            ))}
        </div>
      </div>
    </section>
  );
}

export async function ReviewPage({ reviewId }: { reviewId: string }) {
  const review = await getReview(reviewId);
  if (!review) {
    return (
      <section className="section py-12">
        <ErrorState title="Review not found" description="This review may have been deleted." />
      </section>
    );
  }
  return (
    <section className="section grid gap-8 py-12 lg:grid-cols-[1fr_320px]">
      <ReviewCard review={review} />
      <aside className="rounded-md border border-border bg-white/6 p-5">
        <h2 className="text-xl font-semibold">Discuss</h2>
        <p className="mt-2 text-sm leading-6 text-muted">
          Likes, comments, and spoiler visibility are represented in the API contract and ready for persistence.
        </p>
        <div className="mt-5">
          <ReviewLikeButton reviewId={review.id} initialLiked={review.likedByViewer ?? false} />
        </div>
      </aside>
    </section>
  );
}

export async function ListPage({ listId }: { listId: string }) {
  const [list, comments] = await Promise.all([getList(listId), getListComments(listId)]);
  if (!list) {
    return (
      <section className="section py-12">
        <ErrorState title="List not found" description="This list is unavailable or private." />
      </section>
    );
  }
  return (
    <section className="section space-y-8 py-12">
      <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
        <div className="space-y-8">
          <div className="rounded-md border border-border bg-white/6 p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-sm font-bold uppercase text-primary">Community list</p>
                <h1 className="mt-2 text-4xl font-black">{list.title}</h1>
                <p className="mt-3 max-w-2xl text-sm leading-6 text-muted">{list.description}</p>
              </div>
              {list.isPrivate ? <Lock aria-label="Private list" className="h-6 w-6 text-muted" /> : null}
            </div>
          </div>
          {list.viewerCanEdit ? (
            <ListItemManager list={list} />
          ) : (
            <MediaGrid items={list.items} />
          )}
        </div>
        <ListEngagement list={list} comments={comments} />
      </div>
    </section>
  );
}

export async function NotificationsPage() {
  const notifications = await getNotifications();
  return (
    <section className="section py-12">
      <SectionHeader
        eyebrow="Notifications"
        title="Updates"
        description="List additions, new followers, and activity from people and lists you follow."
        action={<MarkNotificationsReadButton />}
      />
      <div className="space-y-3">
        {notifications.items.length === 0 ? (
          <EmptyState title="No notifications yet" description="Follow people and lists to fill this tab." />
        ) : null}
        {notifications.items.map((notification) => (
          <Link
            key={notification.id}
            href={notification.href}
            className="block rounded-md border border-border bg-white/6 p-4 transition hover:border-primary/50"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="font-semibold">{notification.title}</h2>
                <p className="mt-1 text-sm text-muted">{notification.body}</p>
              </div>
              <time className="shrink-0 text-xs text-muted">{formatDate(notification.createdAt)}</time>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

export async function FeedPage() {
  const feed = await getFeed();
  return (
    <section className="section py-12">
      <SectionHeader eyebrow="Social" title="Activity feed" description="Updates from people you follow." />
      <div className="space-y-4">
        {feed.items.map((event) => (
          <ActivityFeedItem key={event.id} event={event} />
        ))}
      </div>
    </section>
  );
}

export async function ForYouPage() {
  const items = await getRecommendations();
  return (
    <section className="section py-12">
      <SectionHeader
        eyebrow="Recommendations"
        title="For you"
        description="Every recommendation includes an explanation label so the system stays legible."
      />
      <div className="grid gap-4 lg:grid-cols-2">
        {items.map((item) => (
          <Link
            key={`${item.media.mediaType}-${item.media.tmdbId}`}
            href={`/${item.media.mediaType === 'movie' ? 'movie' : 'series'}/${item.media.tmdbId}`}
            className="grid gap-4 rounded-md border border-border bg-white/6 p-4 transition hover:border-primary/50 sm:grid-cols-[110px_1fr]"
          >
            <img
              src={item.media.posterUrl ?? ''}
              alt=""
              width={110}
              height={165}
              loading="lazy"
              className="aspect-[2/3] rounded object-cover"
            />
            <div>
              <p className="text-xs font-bold uppercase text-primary">{item.score}% match</p>
              <h2 className="mt-2 text-2xl font-semibold">{item.media.title}</h2>
              <p className="mt-2 text-sm leading-6 text-muted">{item.reason}</p>
              <div className="mt-4">
                <RatingStars value={item.media.buzzScore / 2} />
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

export async function CollectionPage({
  kind,
  icon,
}: {
  kind: 'watchlist' | 'watched' | 'favorites';
  icon: 'bookmark' | 'check' | 'heart';
}) {
  const items = await getCollection(kind);
  const title = kind === 'watchlist' ? 'Watchlist' : kind === 'watched' ? 'Watched' : 'Favorites';
  const Icon = icon === 'bookmark' ? Bookmark : icon === 'check' ? CheckCircle2 : Heart;
  return (
    <section className="section py-12">
      <SectionHeader
        eyebrow="Library"
        title={title}
        description="Authenticated collection pages are ready for persisted user media states."
        action={
          <span className="rounded-md border border-border bg-white/6 p-3">
            <Icon aria-hidden="true" className="h-5 w-5 text-primary" />
          </span>
        }
      />
      <MediaGrid items={items} emptyTitle={`No ${title.toLowerCase()} yet`} emptyDescription="Add titles from any movie or series page." />
    </section>
  );
}

export function AuthPage({ mode }: { mode: 'login' | 'register' }) {
  const isLogin = mode === 'login';
  return (
    <section className="section grid min-h-[calc(100vh-4rem)] items-center gap-8 py-12 lg:grid-cols-[1fr_440px]">
      <div>
        <p className="text-sm font-bold uppercase text-primary">{isLogin ? 'Welcome back' : 'Create account'}</p>
        <h1 className="mt-3 text-5xl font-black leading-tight">
          {isLogin ? 'Return to your watch graph.' : 'Start building a better taste graph.'}
        </h1>
        <p className="mt-5 max-w-2xl text-lg leading-8 text-muted">
          Secure email auth, Google OAuth, rotating refresh cookies, and protected account routes are part of the
          project contract.
        </p>
      </div>
      <AuthForm mode={mode} />
    </section>
  );
}

export function NewListPage() {
  return (
    <section className="section py-12">
      <SectionHeader
        eyebrow="Lists"
        title="Create a list"
        description="Lists can be public or private, reordered, liked, and commented on."
      />
      <NewListForm />
    </section>
  );
}

export async function SettingsPage({ area }: { area: 'profile' | 'account' | 'security' }) {
  const user = await getCurrentUser();
  const copy = {
    profile: ['Profile settings', 'Edit display name, bio, location, avatar, and favorite genres.'],
    account: ['Account settings', 'Manage email, username, connected OAuth accounts, and export options.'],
    security: ['Security settings', 'Change password, revoke refresh tokens, and log out of all devices.'],
  } satisfies Record<typeof area, [string, string]>;

  return (
    <section className="section grid gap-8 py-12 lg:grid-cols-[260px_1fr]">
      <aside className="rounded-md border border-border bg-white/6 p-4">
        {(['profile', 'account', 'security'] as const).map((item) => (
          <Link key={item} href={`/settings/${item}`} className="block rounded px-3 py-2 text-sm hover:bg-white/8">
            {copy[item][0]}
          </Link>
        ))}
      </aside>
      <div>
        <div className="flex items-center gap-3">
          <ShieldCheck aria-hidden="true" className="h-6 w-6 text-primary" />
          <div>
            <h1 className="text-3xl font-semibold">{copy[area][0]}</h1>
            <p className="mt-1 text-sm text-muted">{copy[area][1]}</p>
          </div>
        </div>
        <div className="mt-6">
          {area === 'profile' ? <ProfileSettingsForm /> : null}
          {area === 'account' ? <AccountSettingsPanel user={user} /> : null}
          {area === 'security' ? <SecuritySettingsForm /> : null}
        </div>
      </div>
    </section>
  );
}

export function NotReadyPage({ title, description }: { title: string; description: string }) {
  return (
    <section className="section py-12">
      <EmptyState title={title} description={description} actionHref="/for-you" actionLabel="View recommendations" />
    </section>
  );
}
