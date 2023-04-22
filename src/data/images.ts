import { URL } from '../types/types.js';

const IMAGE_BASE_URL = 'https://benderbot.co/img';

const IMAGES = {
    uwotm8: [
        `${IMAGE_BASE_URL}/uwot/f.gif`,
        `${IMAGE_BASE_URL}/uwot/b.gif`,
        `${IMAGE_BASE_URL}/uwot/w.gif`,
        `${IMAGE_BASE_URL}/uwot/s.gif`,
        `${IMAGE_BASE_URL}/uwot/k.gif`,
        `${IMAGE_BASE_URL}/uwot/o.gif`,
        `${IMAGE_BASE_URL}/uwot/z.gif`,
        `${IMAGE_BASE_URL}/uwot/t.gif`
    ] as URL[],
    nou: [
        `${IMAGE_BASE_URL}/nou/popplers.jpg`,
        `${IMAGE_BASE_URL}/nou/spaghet.jpg`,
        `${IMAGE_BASE_URL}/nou/robots.jpg`,
        `${IMAGE_BASE_URL}/nou/protest.jpg`,
        `${IMAGE_BASE_URL}/nou/foxhunt.jpg`,
        `${IMAGE_BASE_URL}/nou/valentine.jpg`
    ] as URL[],
    mad: `${IMAGE_BASE_URL}/mad-pimp.png` as URL,
    think: `${IMAGE_BASE_URL}/think.gif` as URL,
    puff: `${IMAGE_BASE_URL}/puff.gif` as URL,
    broken: `${IMAGE_BASE_URL}/broken.jpg` as URL,
    shotgun: `${IMAGE_BASE_URL}/shotgun.gif` as URL,
    watch_it_end: `${IMAGE_BASE_URL}/watch-it-end.gif` as URL,
    no_ass: `${IMAGE_BASE_URL}/no-ass.png` as URL,
    stupid: `${IMAGE_BASE_URL}/stupid.gif` as URL,
    not_allowed: `${IMAGE_BASE_URL}/no.gif` as URL,

    google: `${IMAGE_BASE_URL}/evilcorp.png` as URL,
    ud: `${IMAGE_BASE_URL}/ud.png` as URL,
    wikihow_rps: `${IMAGE_BASE_URL}/rps.jpg` as URL,
    pornhub: `${IMAGE_BASE_URL}/ph.jpg` as URL,
    youtube: `${IMAGE_BASE_URL}/yt.png` as URL,
    games: `${IMAGE_BASE_URL}/games.png` as URL,
    record: `${IMAGE_BASE_URL}/record.png` as URL,
    ghost: `${IMAGE_BASE_URL}/ghost.png` as URL,
    list: `${IMAGE_BASE_URL}/list.png` as URL,
    error: `${IMAGE_BASE_URL}/error.png` as URL,

    apex: `${IMAGE_BASE_URL}/g/apex.png` as URL,
    bf1: `${IMAGE_BASE_URL}/g/bf1.png` as URL,
    bf4: `${IMAGE_BASE_URL}/g/bf4.jpg` as URL,
    bfh: `${IMAGE_BASE_URL}/g/bfh.png` as URL,
    bfv: `${IMAGE_BASE_URL}/g/bfv.jpg` as URL,
    csgo: `${IMAGE_BASE_URL}/g/csgo.png` as URL,
    pubg1: `${IMAGE_BASE_URL}/g/pubg1.png` as URL,
    pubg2: `${IMAGE_BASE_URL}/g/pubg2.png` as URL,
    r6: `${IMAGE_BASE_URL}/g/r6.jpg` as URL,

    info: `${IMAGE_BASE_URL}/info.png` as URL,
    channel: `${IMAGE_BASE_URL}/channel-normal.png` as URL,
    channel_nsfw: `${IMAGE_BASE_URL}/channel-nsfw.png` as URL,
    channel_locked: `${IMAGE_BASE_URL}/channel-locked.png` as URL,
    category: `${IMAGE_BASE_URL}/category.png` as URL,
    voice: `${IMAGE_BASE_URL}/voice-normal.png` as URL,
    voice_locked: `${IMAGE_BASE_URL}/voice-locked.png` as URL
};

export default IMAGES;