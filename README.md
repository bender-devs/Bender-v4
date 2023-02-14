# Bender-v4
_The latest and greatest version of Bender._

|   |   |
|---|---|
| Support Server | https://discord.com/invite/99xaeGn |
| Website | https://benderbot.co |
| Developing Bender | [Click here](docs/developing-bender.md) |

## ⚠ WORK IN PROGRESS! ⚠

This rewrite is ambitious: A full rewrite using a new language and a custom library. The framework seems very stable, having handled more than a million consecutive events without any errors or crashes several times. However, many use cases haven't been tested, so we wouldn't consider any of it production-ready yet. The framework will be improved as needed according to the requirements of the features being added.

## Translations

As we add features and get closer to completion, we're looking for people to help translate the bot so it can be used in multiple languages! If you're interested, please monitor this repo and join our [support server](https://discord.gg/99xaeGn) to let us know! You can also just create a PR directly, though we'd prefer if you joined as well, in case there's anything to discuss with other people that are translating or reviewing translations.

#### A couple things to keep in mind:

- If you're not familiar with JSON formatting, the parts in quotations before the colon, i.e. `"GUILD_ONLY"`, are called the keys, and the parts after are called the values.

- Only the values should be translated, NOT the keys. This includes the keys with a bunch of dashes (i.e. `"----------- Generic command errors -----------": ""`), since translating these will trigger a warning on startup that the language is incomplete.

- The double bracket format (`{{variable}}`) is used to replace parts of the text with other values; for example, `{{invite}}` would be replaced with `https://discord.gg/99xaeGn`. The variables should be moved around to fit the context, but shouldn't be translated, edited, or deleted.

To see examples, compare [en_US.json](/src/text/en_US.json) to one of the `.json` files for another language.

## Note about premium features

Code for most/all premium commands and features will not be open-source (at least for the time being.) We need to continue providing an incentive for users to support our work and cover server costs. We may be able to open-source these parts as well in the future, depending on the level of support we are fortunate enough to reach. :)