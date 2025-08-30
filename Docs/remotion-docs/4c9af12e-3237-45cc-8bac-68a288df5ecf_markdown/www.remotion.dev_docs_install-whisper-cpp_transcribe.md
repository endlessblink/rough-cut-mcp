[Skip to main content](https://www.remotion.dev/docs/install-whisper-cpp/transcribe#__docusaurus_skipToContent_fallback)

On this page

Transcribes a media file by utilizing Whisper.cpp.

You should first install Whisper.cpp, for example through [`installWhisperCpp()`](https://www.remotion.dev/docs/install-whisper-cpp/install-whisper-cpp).

note

This function only works with Whisper.cpp 1.5.5 or later, unless `tokenLevelTimestamps` is set to false.

```

transcribe.mjs
tsx

import path from 'path';
import {transcribe} from '@remotion/install-whisper-cpp';

const {transcription} = await transcribe({
  inputPath: '/path/to/audio.wav',
  whisperPath: path.join(process.cwd(), 'whisper.cpp'),
  whisperCppVersion: '1.5.5',
  model: 'medium.en',
  tokenLevelTimestamps: true,
});

for (const token of transcription) {
  console.log(token.timestamps.from, token.timestamps.to, token.text);
}
```

## Options [​](https://www.remotion.dev/docs/install-whisper-cpp/transcribe\#options "Direct link to Options")

### `inputPath` [​](https://www.remotion.dev/docs/install-whisper-cpp/transcribe\#inputpath "Direct link to inputpath")

The path to the file you want extract text from.

The file has to be a 16-bit, 16KHz, WAVE file. See [Resample audio to 16kHz](https://www.remotion.dev/docs/webcodecs/resample-audio-16khz#on-the-server) for more information.

### `whisperPath` [​](https://www.remotion.dev/docs/install-whisper-cpp/transcribe\#whisperpath "Direct link to whisperpath")

The path to your `whisper.cpp` folder.

If you haven't installed Whisper.cpp, you can do so for example through [`installWhisperCpp()`](https://www.remotion.dev/docs/install-whisper-cpp/install-whisper-cpp) and use the same `folder`.

### `tokenLevelTimestamps` [v4.0.131](https://github.com/remotion-dev/remotion/releases/v4.0.131) [​](https://www.remotion.dev/docs/install-whisper-cpp/transcribe\#tokenleveltimestamps "Direct link to tokenleveltimestamps")

Passes the `--dtw` flag to Whisper.cpp to generate more accurate timestamps, which are being returned under the `t_dtw` field.

Recommended to get actually accurate timings, but only available from Whisper.cpp versions later than 1.0.55.

Set to `false` if you use an older version of Whisper.cpp.

### `model?` [​](https://www.remotion.dev/docs/install-whisper-cpp/transcribe\#model "Direct link to model")

_default: `base.en`_

Specify a specific Whisper model for the transcription.

Possible values: `tiny`, `tiny.en`, `base`, `base.en`, `small`, `small.en`, `medium`, `medium.en`, `large-v1`, `large-v2`, `large-v3`, `large-v3-turbo`.

Make sure the model you want to use exists in your `whisper.cpp/models` folder. You can ensure a specific model is available locally by utilizing the [downloadWhisperModel()](https://www.remotion.dev/docs/install-whisper-cpp/download-whisper-model) API.

Note: `large-v3-turbo` is only working properly from Whisper.cpp versions built from November 2024 or later and Remotion v4.0.229 or greater.

### `modelFolder?` [​](https://www.remotion.dev/docs/install-whisper-cpp/transcribe\#modelfolder "Direct link to modelfolder")

_default: whisperPath/models_

If you saved Whisper models to a specific folder, pass its path here.

Uses the `whisper.cpp/models` folder at the location defined through `whisperPath` as default.

### `translateToEnglish?` [​](https://www.remotion.dev/docs/install-whisper-cpp/transcribe\#translatetoenglish "Direct link to translatetoenglish")

_default: false_

Set this boolean flag to `true` if you want to get a translated transcription of the provided file in English.
Make sure to not use a \*.en model, as they will not be able to translate a foreign language to english.

note

We recommend using at least the `medium` model to get satisfactory results when translating.

### `printOutput?` [v4.0.132](https://github.com/remotion-dev/remotion/releases/v4.0.132) [​](https://www.remotion.dev/docs/install-whisper-cpp/transcribe\#printoutput "Direct link to printoutput")

Whether to print the output of the transcription process to the console. Defaults to `true`.

### `tokensPerItem?` [v4.0.141](https://github.com/remotion-dev/remotion/releases/v4.0.141) [​](https://www.remotion.dev/docs/install-whisper-cpp/transcribe\#tokensperitem "Direct link to tokensperitem")

_default: `1`_

The maximum amount of tokens included in each transcription item.

Set this flag to `null`, to use `whisper.cpp`'s default token grouping (useful for generating a movie-style transcription).

info

`tokensPerItem` can only be set when `tokenLevelTimestamps` is set to `false`.

### `splitOnWord?` [v4.0.208](https://github.com/remotion-dev/remotion/releases/v4.0.208) [​](https://www.remotion.dev/docs/install-whisper-cpp/transcribe\#splitonword "Direct link to splitonword")

[Adds the `--split-on-word` flag to Whisper.cpp](https://github.com/remotion-dev/remotion/pull/4257) for cleaner word-for-word output.

### `language?` [v4.0.142](https://github.com/remotion-dev/remotion/releases/v4.0.142) [​](https://www.remotion.dev/docs/install-whisper-cpp/transcribe\#language "Direct link to language")

_default: null_

Passes the `-l` flag to Whisper.cpp to specific spoken language of the audio file.

Possible values: `Afrikaans`, `Albanian`, `Amharic`, `Arabic`, `Armenian`, `Assamese`, `Azerbaijani`, `Bashkir`, `Basque`, `Belarusian`, `Bengali`, `Bosnian`, `Breton`, `Bulgarian`, `Burmese`, `Castilian`, `Catalan`, `Chinese`, `Croatian`, `Czech`, `Danish`, `Dutch`, `English`, `Estonian`, `Faroese`, `Finnish`, `Flemish`, `French`, `Galician`, `Georgian`, `German`, `Greek`, `Gujarati`, `Haitian`, `Haitian Creole`, `Hausa`, `Hawaiian`, `Hebrew`, `Hindi`, `Hungarian`, `Icelandic`, `Indonesian`, `Italian`, `Japanese`, `Javanese`, `Kannada`, `Kazakh`, `Khmer`, `Korean`, `Lao`, `Latin`, `Latvian`, `Letzeburgesch`, `Lingala`, `Lithuanian`, `Luxembourgish`, `Macedonian`, `Malagasy`, `Malay`, `Malayalam`, `Maltese`, `Maori`, `Marathi`, `Moldavian`, `Moldovan`, `Mongolian`, `Myanmar`, `Nepali`, `Norwegian`, `Nynorsk`, `Occitan`, `Panjabi`, `Pashto`, `Persian`, `Polish`, `Portuguese`, `Punjabi`, `Pushto`, `Romanian`, `Russian`, `Sanskrit`, `Serbian`, `Shona`, `Sindhi`, `Sinhala`, `Sinhalese`, `Slovak`, `Slovenian`, `Somali`, `Spanish`, `Sundanese`, `Swahili`, `Swedish`, `Tagalog`, `Tajik`, `Tamil`, `Tatar`, `Telugu`, `Thai`, `Tibetan`, `Turkish`, `Turkmen`, `Ukrainian`, `Urdu`, `Uzbek`, `Valencian`, `Vietnamese`, `Welsh`, `Yiddish`, `Yoruba`, `Zulu`.
`af`, `am`, `ar`, `as`, `az`, `ba`, `be`, `bg`, `bn`, `bo`, `br`, `bs`, `ca`, `cs`, `cy`, `da`, `de`, `el`, `en`, `es`, `et`, `eu`, `fa`, `fi`, `fo`, `fr`, `gl`, `gu`, `ha`, `haw`, `he`, `hi`, `hr`, `ht`, `hu`, `hy`, `id`, `is`, `it`, `ja`, `jw`, `ka`, `kk`, `km`, `kn`, `ko`, `la`, `lb`, `ln`, `lo`, `lt`, `lv`, `mg`, `mi`, `mk`, `ml`, `mn`, `mr`, `ms`, `mt`, `my`, `ne`, `nl`, `nn`, `no`, `oc`, `pa`, `pl`, `ps`, `pt`, `ro`, `ru`, `sa`, `sd`, `si`, `sk`, `sl`, `sn`, `so`, `sq`, `sr`, `su`, `sv`, `sw`, `ta`, `te`, `tg`, `th`, `tk`, `tl`, `tr`, `tt`, `uk`, `ur`, `uz`, `vi`, `yi`, `yo`, `zh` or `auto`.

### `signal?` [v4.0.156](https://github.com/remotion-dev/remotion/releases/v4.0.156) [​](https://www.remotion.dev/docs/install-whisper-cpp/transcribe\#signal "Direct link to signal")

A signal from an [`AbortController`](https://developer.mozilla.org/en-US/docs/Web/API/AbortController) to cancel the transcription process.

### `onProgress?` [v4.0.156](https://github.com/remotion-dev/remotion/releases/v4.0.156) [​](https://www.remotion.dev/docs/install-whisper-cpp/transcribe\#onprogress "Direct link to onprogress")

Listen for progress updates from the transcription process.

The progress is a number between `0` and `1`.

```

tsx

import type {TranscribeOnProgress} from '@remotion/install-whisper-cpp';

const onProgress: TranscribeOnProgress = (progress) => {
  console.log(`Transcription progress: ${progress * 100}%`);
};
```

### `flashAttention?` [v4.0.324](https://github.com/remotion-dev/remotion/releases/v4.0.324) [​](https://www.remotion.dev/docs/install-whisper-cpp/transcribe\#flashattention "Direct link to flashattention")

Boolean value, enable flash attention.

### `additionalArgs?` [v4.0.324](https://github.com/remotion-dev/remotion/releases/v4.0.324) [​](https://www.remotion.dev/docs/install-whisper-cpp/transcribe\#additionalargs "Direct link to additionalargs")

Additional args to be passed to whisper, in an array. The array can contain strings or string pairs, like

```

js

transcribe({
  ...,
  additionalArgs: ['-tdrz', ['--max-len', '1']]
})
```

## Return value [​](https://www.remotion.dev/docs/install-whisper-cpp/transcribe\#return-value "Direct link to Return value")

### `TranscriptionJson` [​](https://www.remotion.dev/docs/install-whisper-cpp/transcribe\#transcriptionjson "Direct link to transcriptionjson")

An object containing all the metadata and transcriptions resulting from the transcription process.

```

ts

type Timestamps = {
  from: string;
  to: string;
};

type Offsets = {
  from: number;
  to: number;
};

type WordLevelToken = {
  t_dtw: number;
  text: string;
  timestamps: Timestamps;
  offsets: Offsets;
  id: number;
  p: number;
};

type TranscriptionItem = {
  timestamps: Timestamps;
  offsets: Offsets;
  text: string;
};

type TranscriptionItemWithTimestamp = TranscriptionItem & {
  tokens: WordLevelToken[];
};

type Model = {
  type: string;
  multilingual: boolean;
  vocab: number;
  audio: {
    ctx: number;
    state: number;
    head: number;
    layer: number;
  };
  text: {
    ctx: number;
    state: number;
    head: number;
    layer: number;
  };
  mels: number;
  ftype: number;
};

type Params = {
  model: string;
  language: string;
  translate: boolean;
};

type Result = {
  language: string;
};

export type TranscriptionJson<WithTokenLevelTimestamp extends boolean> = {
  systeminfo: string;
  model: Model;
  params: Params;
  result: Result;
  transcription: true extends WithTokenLevelTimestamp ? TranscriptionItemWithTimestamp[] : TranscriptionItem[];
};
```

Prefer relying on the `t_dtw` value for accurate timestamps over `offsets`.

Use [`convertToCaptions()`](https://www.remotion.dev/docs/install-whisper-cpp/convert-to-captions) to use our opinionated suggestion for postprocessing the captions.

## See also [​](https://www.remotion.dev/docs/install-whisper-cpp/transcribe\#see-also "Direct link to See also")

- [Source code for this function](https://github.com/remotion-dev/remotion/blob/main/packages/install-whisper-cpp/src/transcribe.ts)
- [`@remotion/install-whisper-cpp`](https://www.remotion.dev/docs/install-whisper-cpp)
- [`convertToCaptions()`](https://www.remotion.dev/docs/install-whisper-cpp/convert-to-captions)
- [`downloadWhisperModel()`](https://www.remotion.dev/docs/install-whisper-cpp/download-whisper-model)
- [`installWhisperCpp()`](https://www.remotion.dev/docs/install-whisper-cpp/install-whisper-cpp)

- [Options](https://www.remotion.dev/docs/install-whisper-cpp/transcribe#options)
  - [`inputPath`](https://www.remotion.dev/docs/install-whisper-cpp/transcribe#inputpath)
  - [`whisperPath`](https://www.remotion.dev/docs/install-whisper-cpp/transcribe#whisperpath)
  - [`tokenLevelTimestamps`](https://www.remotion.dev/docs/install-whisper-cpp/transcribe#tokenleveltimestamps)
  - [`model?`](https://www.remotion.dev/docs/install-whisper-cpp/transcribe#model)
  - [`modelFolder?`](https://www.remotion.dev/docs/install-whisper-cpp/transcribe#modelfolder)
  - [`translateToEnglish?`](https://www.remotion.dev/docs/install-whisper-cpp/transcribe#translatetoenglish)
  - [`printOutput?`](https://www.remotion.dev/docs/install-whisper-cpp/transcribe#printoutput)
  - [`tokensPerItem?`](https://www.remotion.dev/docs/install-whisper-cpp/transcribe#tokensperitem)
  - [`splitOnWord?`](https://www.remotion.dev/docs/install-whisper-cpp/transcribe#splitonword)
  - [`language?`](https://www.remotion.dev/docs/install-whisper-cpp/transcribe#language)
  - [`signal?`](https://www.remotion.dev/docs/install-whisper-cpp/transcribe#signal)
  - [`onProgress?`](https://www.remotion.dev/docs/install-whisper-cpp/transcribe#onprogress)
  - [`flashAttention?`](https://www.remotion.dev/docs/install-whisper-cpp/transcribe#flashattention)
  - [`additionalArgs?`](https://www.remotion.dev/docs/install-whisper-cpp/transcribe#additionalargs)
- [Return value](https://www.remotion.dev/docs/install-whisper-cpp/transcribe#return-value)
  - [`TranscriptionJson`](https://www.remotion.dev/docs/install-whisper-cpp/transcribe#transcriptionjson)
- [See also](https://www.remotion.dev/docs/install-whisper-cpp/transcribe#see-also)

Remotion

![Logo](https://raw.githubusercontent.com/remotion-dev/brand/refs/heads/main/logo.svg)

Remotion

You may ask your questions about the Remotion documentation and the bot answers it based on the documentation. Go through the sources for better answers appropriately.

QUICK QUESTIONS

How to install it?

How to setup Remotion Lambda?

Why is my composition flickering?

Powered by [CrawlChat](https://crawlchat.app/?ref=powered-by-remotion)

Ask AI