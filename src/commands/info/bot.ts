import { cpus, freemem, totalmem } from 'os';
import {
    DASHBOARD,
    DEFAULT_COLOR,
    GITHUB_LINK,
    OWNERS,
    SUPPORT_SERVER,
    VERSION,
    WEBSITE,
} from '../../data/constants.js';
import type { Embed, Interaction } from '../../types/types.js';
import CDNUtils from '../../utils/cdn.js';
import DiscordUtils from '../../utils/discord.js';
import LangUtils from '../../utils/language.js';
import TimeUtils from '../../utils/time.js';
import type InfoCommand from '../info.js';

// modified from https://github.com/oscmejia/os-utils
function getCPUInfo() {
    const cpuInfo = cpus();
    let idle = 0,
        used = 0;
    for (const cpu in cpuInfo) {
        const t = cpuInfo[cpu].times;
        used += t.user + t.nice + t.sys + t.irq;
        idle += t.idle;
    }
    return { idle, used };
}
const getCPULoad = async (interval = 1000): Promise<number> => {
    return new Promise((resolve) => {
        const start = getCPUInfo();
        setTimeout(() => {
            const end = getCPUInfo();

            const idle = end.idle - start.idle;
            const used = end.used - start.used;
            const perc = used / (used + idle);

            resolve(Math.round(perc * 10000) / 100); // include 2 decimal places
        }, interval);
    });
};

const getMemoryUsage = () => {
    return Math.round(((totalmem() - freemem()) / totalmem()) * 10000) / 100; // include 2 decimal places
};

export default async function (this: InfoCommand, interaction: Interaction) {
    await this.ack(interaction); // TODO: handle errors

    let guildCount = 0,
        memberCount = 0,
        channelCount = 0;
    if (this.bot.shard) {
        const counts = await this.bot.shard
            .getValues('ALL', ['guildCount', 'memberCount', 'channelCount'])
            .catch(() => null);
        if (counts) {
            guildCount = counts.map((data) => data?.guildCount || 0).reduce((prev, current) => prev + current);
            memberCount = counts.map((data) => data?.memberCount || 0).reduce((prev, current) => prev + current);
            channelCount = counts.map((data) => data?.channelCount || 0).reduce((prev, current) => prev + current);
        }
    } else {
        guildCount = this.bot.cache.guilds.size();
        memberCount = this.bot.cache.members.totalSize();
        channelCount = this.bot.cache.channels.totalSize();
    }

    const uptimeMs = process.uptime() * 1000;
    const upSince = Date.now() - uptimeMs;
    const cpuLoad = await getCPULoad();
    const memoryUsage = await getMemoryUsage();

    const duration = TimeUtils.formatDuration(uptimeMs, interaction.locale);
    const date = TimeUtils.formatDate(upSince);
    let description = LangUtils.getAndReplace('BOT_INFO_UPTIME', { duration, date }, interaction.locale);
    description += `\n${LangUtils.getAndReplace(
        'BOT_INFO_PING',
        { ping: this.bot.gateway.ping },
        interaction.locale
    )} | `;
    description += LangUtils.getAndReplace('BOT_INFO_CPU', { cpu: cpuLoad }, interaction.locale);
    description += ` | ${LangUtils.getAndReplace(
        'BOT_INFO_MEMORY',
        { memory: memoryUsage },
        interaction.locale
    )}\n`;

    if (this.bot.shard) {
        description += `${LangUtils.getAndReplace(
            'BOT_INFO_SHARDS',
            { shards: this.bot.shard.total_shards },
            interaction.locale
        )} | `;
    }
    description += `${LangUtils.getAndReplace(
        'BOT_INFO_SERVERS',
        { servers: guildCount || '???' },
        interaction.locale
    )} | `;
    description += `${LangUtils.getAndReplace(
        'BOT_INFO_CHANNELS',
        { channels: channelCount || '???' },
        interaction.locale
    )} | `;
    description += `${LangUtils.getAndReplace(
        'BOT_INFO_MEMBERS',
        { members: memberCount || '???' },
        interaction.locale
    )}\n\n`;

    const joeEmoji = this.bot.utils.getEmoji('JOE', interaction);
    const joe = await this.bot.api.user.fetch(OWNERS[0]);
    let devInfo = `${joeEmoji} \`${joe ? DiscordUtils.user.getTag(joe) : 'Joe'}\``;
    const markEmoji = this.bot.utils.getEmoji('MARK', interaction);
    const mark = await this.bot.api.user.fetch(OWNERS[1]);
    devInfo += ` | ${markEmoji} \`${mark ? DiscordUtils.user.getTag(mark) : 'Mark'}\``;
    const lucyEmoji = this.bot.utils.getEmoji('LUCY', interaction);
    const lucy = await this.bot.api.user.fetch(OWNERS[2]);
    devInfo += ` | ${lucyEmoji} \`${lucy ? DiscordUtils.user.getTag(lucy) : 'Lucy'}\``;

    description += LangUtils.getAndReplace('BOT_INFO_DEVELOPERS', { devInfo }, interaction.locale);
    description += `\n${LangUtils.get('BOT_INFO_LIBRARY', interaction.locale)}`;
    description += `  | [${this.bot.utils.getEmoji('GITHUB', interaction)} ${LangUtils.get(
        'BOT_INFO_LINKS_GITHUB',
        interaction.locale
    )}](${GITHUB_LINK})\n\n`;

    description += `[${this.bot.utils.getEmoji('LINK', interaction)} ${LangUtils.get(
        'BOT_INFO_LINKS_ADD',
        interaction.locale
    )}](${WEBSITE}/${process.env.RUNTIME_MODE === 'BETA' ? 'beta_' : ''}invite)`;
    description += ` | [${this.bot.utils.getEmoji('CHAT', interaction)} ${LangUtils.get(
        'BOT_INFO_LINKS_SUPPORT',
        interaction.locale
    )}](${SUPPORT_SERVER})`;
    description += ` | [${this.bot.utils.getEmoji('TOS', interaction)} ${LangUtils.get(
        'BOT_INFO_LINKS_TOS',
        interaction.locale
    )}](${WEBSITE}/tos)`;
    description += `\n[${this.bot.utils.getEmoji('SITE', interaction)} ${LangUtils.get(
        'BOT_INFO_LINKS_SITE',
        interaction.locale
    )}](${WEBSITE})`;
    description += ` | [${this.bot.utils.getEmoji('DASH', interaction)} ${LangUtils.get(
        'BOT_INFO_LINKS_DASHBOARD',
        interaction.locale
    )}](${DASHBOARD})`;
    description += ` | [${this.bot.utils.getEmoji('PRO', interaction)} ${LangUtils.get(
        'BOT_INFO_LINKS_PRO',
        interaction.locale
    )}](${WEBSITE}/pro)`;

    const embed: Embed = { description, color: DEFAULT_COLOR };
    if (this.bot.user.avatar) {
        embed.author = {
            name: `Bender v${VERSION}`,
            icon_url: CDNUtils.userAvatar(this.bot.user.id, this.bot.user.avatar),
        };
    } else {
        embed.title = `Bender v${VERSION}`;
    }

    return this.deferredResponse(interaction, { embeds: [embed] });
}
