import type { Profile } from '@buzzshot/shared';
import { FollowButton } from './action-buttons';

export function ProfileHeader({ profile }: { profile: Profile }) {
  return (
    <section className="rounded-md border border-border bg-white/6 p-6">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <img
            src={profile.avatarUrl ?? ''}
            alt=""
            width={80}
            height={80}
            className="h-20 w-20 rounded-md border border-border bg-white/10"
          />
          <div>
            <h1 className="text-3xl font-semibold">{profile.displayName}</h1>
            <p className="mt-1 text-sm text-muted">@{profile.username}</p>
            {profile.bio ? <p className="mt-3 max-w-2xl text-sm leading-6 text-muted">{profile.bio}</p> : null}
          </div>
        </div>
        {profile.viewer?.canEdit ? null : (
          <FollowButton
            userId={profile.id}
            username={profile.username}
            initialFollowing={profile.viewer?.isFollowing ?? false}
          />
        )}
      </div>
      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-5">
        {Object.entries(profile.stats).map(([label, value]) => (
          <div key={label} className="rounded-md border border-border bg-black/25 p-3">
            <div className="text-xl font-semibold">{value}</div>
            <div className="text-xs uppercase text-muted">{label}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
