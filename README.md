[![make.fun · gta6-trophy-guide-01](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![rank](https://make.fun/badge/gta6-trophy-guide-01/Schyd/gta6-trophy-guide-01/rank.svg)](https://make.fun/bounty/gta6-trophy-guide-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![reward](https://make.fun/badge/gta6-trophy-guide-01/Schyd/gta6-trophy-guide-01/reward.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)

# Leonida Legend — GTA VI Trophy Guide & Tracker

The complete offline guide and tracker for all 55 Grand Theft Auto VI trophies
on PlayStation 5: 1 platinum, 2 gold, 6 silver, 46 bronze. Every trophy carries
its official name, description and grade as PlayStation publishes them, plus a
guide in the guide's own words, the source that guide rests on, a kind, a
roadmap stage and a missable flag.

What it does:

- **Checklist tracker** — tick trophies off as you earn them; progress saves in
  your browser (localStorage), and you can export it to a file and import it
  back on any device.
- **Filters** — by kind (story, missable, collectibles, activities, online),
  by grade, by earned or still to earn, plus a search box.
- **Spoiler setting** — story trophies stay hidden (name, description and
  guide) until you earn them, unless you switch the setting off.
- **Platinum roadmap** — the four stages to the platinum in order, with the
  time each one takes (about 200 hours in all, one playthrough, no online
  trophies).
- **Missables** — the one trophy that may be missable (Positive Mental
  Attitude, the Chapter 1 meditation) is flagged and explained in full; the
  guide also says plainly that everything else cannot be missed.

The guides cite their sources by name and link beside each trophy — PowerPyx,
HowToVideoGame, GTA Zone, Sixshore, CryptoGames and the official trophy
descriptions. Where no guide has confirmed a detail yet, the guide says so
instead of inventing one.

## Run it

The app is plain static files under `app/` — no build step, no network, no
account. Serve the folder and open it in a desktop browser:

```sh
node serve.ts
# open http://localhost:8080
```

or any static server pointed at `app/`. Everything the page loads is a file
inside `app/`; it works with the network off.

Deep links: `#roadmap` and `#missable` open those views, `#trophy-28`
opens one trophy's guide, and `#earned=2,3,8` previews those trophies as
earned for the session without saving anything.

## Data

`app/data/trophies.json` holds the 55 official trophies: each one with its
official name, description and grade, plus the guide's own guide text, the
sources that guide rests on, its kind (story, stranger, collectible, activity,
crime, money, feat, completion or platinum), whether it is hidden on
PlayStation until earned (28 are), whether it can be missed (only one can),
and which roadmap stage it belongs to.

## Links

- Bounty: https://make.fun/bounty/gta6-trophy-guide-01
- Referral: https://make.fun/r/3fv3pwmg
- make.fun: https://make.fun
