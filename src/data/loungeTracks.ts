export type TimedLyric = {
  start: number
  text: string
  section: string
}

export type LoungeTrack = {
  id: string
  title: string
  subtitle: string
  src: string
  duration: number
  lyrics: TimedLyric[]
}

const wrapLyrics: TimedLyric[] = [
  { section: 'Intro', start: 0.4, text: 'Yeah, we finally did it' },
  { section: 'Intro', start: 3.2, text: 'Count the checks, pop the cork' },
  { section: 'Intro', start: 6.0, text: '(Oh yeah)' },
  { section: 'Intro', start: 8.6, text: 'Look at the team right now' },

  { section: 'Chorus', start: 11.2, text: "That's a wrap, pop the bottle on the ice" },
  { section: 'Chorus', start: 14.4, text: 'Worked all month, now we paid the full price' },
  { section: 'Chorus', start: 17.6, text: 'Got the whole crew spinning on the floor' },
  { section: 'Chorus', start: 20.8, text: 'We hit the top, now we coming back for more' },
  { section: 'Chorus', start: 24.0, text: "(That's a wrap)" },
  { section: 'Chorus', start: 26.4, text: 'Yeah, we did it big' },
  { section: 'Chorus', start: 28.8, text: "(That's a wrap)" },
  { section: 'Chorus', start: 31.2, text: 'Bust a groove, feel the dig' },

  { section: 'Verse 1', start: 36.8, text: 'Six weeks straight on the daily grind' },
  { section: 'Verse 1', start: 40.0, text: "Now it's silk shirts, leaving stress behind" },
  { section: 'Verse 1', start: 43.2, text: 'Catering stack with the wagyu beef steak' },
  { section: 'Verse 1', start: 46.4, text: 'Pouring up champagne, look at what we make' },
  { section: 'Verse 1', start: 49.2, text: '(Toast to that)' },
  { section: 'Verse 1', start: 52.4, text: 'Rings on the fingers like the ninety-eight Bulls' },
  { section: 'Verse 1', start: 55.6, text: 'Tables all set, every VIP full' },
  { section: 'Verse 1', start: 58.8, text: 'No work tonight, we just let the groove ride' },
  { section: 'Verse 1', start: 62.0, text: 'Heavy slap bass got the whole room wide' },
  { section: 'Verse 1', start: 65.2, text: 'Gucci on the shoes, linen on the sleeve' },
  { section: 'Verse 1', start: 68.4, text: "If you ain't celebrating, better take your leave" },
  { section: 'Verse 1', start: 71.6, text: 'We took the trophy home, put it on display' },
  { section: 'Verse 1', start: 74.8, text: 'Dancing till the morning, turned night into day' },

  { section: 'Chorus', start: 84.8, text: "That's a wrap, pop the bottle on the ice" },
  { section: 'Chorus', start: 88.0, text: 'Worked all month, now we paid the full price' },
  { section: 'Chorus', start: 91.2, text: 'Got the whole crew spinning on the floor' },
  { section: 'Chorus', start: 94.4, text: 'We hit the top, now we coming back for more' },
  { section: 'Chorus', start: 97.6, text: "(That's a wrap)" },
  { section: 'Chorus', start: 100.0, text: 'Yeah, we did it big' },
  { section: 'Chorus', start: 102.4, text: "(That's a wrap)" },
  { section: 'Chorus', start: 104.8, text: 'Bust a groove, feel the dig' },

  { section: 'Verse 2', start: 110.4, text: 'Fresh sushi platter, sparkling vintage wine' },
  { section: 'Verse 2', start: 113.8, text: 'Look around the lounge, everybody looking fine' },
  { section: 'Verse 2', start: 117.2, text: 'Director stepped in, put the bonus in the bank' },
  { section: 'Verse 2', start: 120.6, text: "Told the whole team that it's us he gotta thank" },
  { section: 'Verse 2', start: 123.4, text: '(Thank the crew)' },
  { section: 'Verse 2', start: 126.6, text: 'Catching that tempo, rolling like a champ' },
  { section: 'Verse 2', start: 129.8, text: 'Disco ball shines on the bassline ramp' },
  { section: 'Verse 2', start: 133.0, text: 'Unbutton the collar, let the bass drum knock' },
  { section: 'Verse 2', start: 136.2, text: 'Turning up the energy, running out the clock' },
  { section: 'Verse 2', start: 139.4, text: 'Zero stress left, we just stepped off stage' },
  { section: 'Verse 2', start: 142.6, text: 'Turned a whole decade to a brand new page' },

  { section: 'Chorus', start: 152.4, text: "That's a wrap, pop the bottle on the ice" },
  { section: 'Chorus', start: 155.6, text: 'Worked all month, now we paid the full price' },
  { section: 'Chorus', start: 158.8, text: 'Got the whole crew spinning on the floor' },
  { section: 'Chorus', start: 162.0, text: 'We hit the top, now we coming back for more' },
  { section: 'Chorus', start: 165.2, text: "(That's a wrap)" },
  { section: 'Chorus', start: 167.6, text: 'Yeah, we did it big' },
  { section: 'Chorus', start: 170.0, text: "(That's a wrap)" },
  { section: 'Chorus', start: 172.4, text: 'Bust a groove, feel the dig' },

  { section: 'Outro', start: 177.6, text: "(That's a wrap)" },
  { section: 'Outro', start: 179.2, text: 'Take a bow now' },
  { section: 'Outro', start: 180.6, text: "(That's a wrap)" },
  { section: 'Outro', start: 181.8, text: 'Yeah, we done now' },
  { section: 'Outro', start: 183.2, text: "Shut it down, party's over, we won" },
]

export const LOUNGE_TRACKS: LoungeTrack[] = [
  {
    id: 'thats-a-wrap',
    title: "That's A Wrap",
    subtitle: 'Disco Funk',
    src: 'music/thats-a-wrap.mp3',
    duration: 183,
    lyrics: wrapLyrics,
  },
]

export function getLoungeTrack(id: string) {
  return LOUNGE_TRACKS.find((track) => track.id === id) ?? LOUNGE_TRACKS[0]
}

export function activeLyricIndex(lyrics: TimedLyric[], time: number) {
  if (!lyrics.length || time < lyrics[0].start) return -1
  let active = 0
  for (let i = 0; i < lyrics.length; i += 1) {
    if (time >= lyrics[i].start) active = i
    else break
  }
  return active
}

export function lyricSections(lyrics: TimedLyric[]) {
  const sections: { title: string; lines: { index: number; text: string }[] }[] = []
  let current = ''
  for (let i = 0; i < lyrics.length; i += 1) {
    const line = lyrics[i]
    if (line.section !== current) {
      current = line.section
      sections.push({ title: current, lines: [] })
    }
    sections[sections.length - 1].lines.push({ index: i, text: line.text })
  }
  return sections
}
