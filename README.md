# cardcore

this project uses [mental poker](https://en.wikipedia.org/wiki/Mental_poker) algorithms (specifically, the ed25519 operations provided by [@streamplace/ssb-keys](https://github.com/ssbc/@streamplace/ssb-keys)) to implement a decentralized trading card game conceptually similar to Magic: The Gathering or Hearthstone. this allows you to play secure games without a central authority or server.

## development

yarn workspaces seem to be the easiest way to monorepo right now so we're using that.

```
yarn install
npm run start
```

## actions

required fields on an action:

- prev (null for CREATE_GAME)
- next
- user
- type
- signature
