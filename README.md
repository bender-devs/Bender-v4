# Bender-v4
The latest and greatest version of Bender.

## ⚠ CURRENTLY JUST A FRAMEWORK! ⚠

This rewrite is ambitious: A full rewrite using a new language and a custom library. At the moment it's in testing, but most of the hard work is done. We'll be gradually adding commands and features while overhauling the bot's efficiency and user experience.

## Translations

As we add features and get closer to completion, we're looking for people to help translate the bot so it can be used in multiple languages! If you're interested, please monitor this repo and join our [support server](https://discord.gg/99xaeGn) to let us know! You can also just create a PR directly, though we'd prefer if you joined as well, in case there's anything to discuss with other people that are translating or reviewing translations.

#### A couple things to keep in mind:

- If you're not familiar with JSON formatting, all you need to know for the scope of this project are that the keys, i.e. `"GUILD_ONLY"`, should be left as-is, and the values after them should be translated.

- The keys with a bunch of dashes (i.e. `"----------- Generic command errors -----------": ""`) are considered comments. You can translate them if you want, but it's just for organization.

- The double bracket format (`{{variable}}`) is used to replace parts of the text with other values; for example, `{{invite}}` would be replaced with `https://discord.gg/99xaeGn`. The variables should be moved around to fit the context, but shouldn't be translated or edited.

To see examples, compare [en_US.json](/src/text/en_US.json) to one of the `.json` files for another language.

## Note about premium features

Code for most/all premium commands and features will not be open-source (at least for the time being.) We need to continue providing an incentive for users to support our work and cover server costs. We may be able to open-source these parts as well in the future, depending on the level of support we are fortunate enough to reach. :)