# Contributing

This codebase originating in the [ConRes/fft][] repository on GitHub brings together a number of open source contributions from various authors demonstrating different ways to implement fast-enough fourier transformations for the web and other platforms.

The effort is still too early for a contributions, but please feel free to open an issue to discuss any ideas for contribution.

[conres/fft]: "https://github.com/ConRes/fft/"

## Getting Started

### `1` Forking

It is best to first fork the repository to your own github account. Once forked, you can clone locally from your fork.

```sh
# TODO: Replace ‹user› with your own handle
git clone https://github.com/‹user›/fft
```

If you plan to make pull requests, make sure you commit your code into a new separate branch based the respective upstream branch, like `feature-‹…›` based on `master`, which will save you a lot of effort when it is time to open the pull request.

### `2` Tooling

You will need a number of standard tools in place before you can get up and running. In most cases, the tools will be automatically installed when you run `npm i` assuming you already have [Node.js 13.2.0](https://nodejs.org/en/download/releases/) or later already installed and suitable configured in your shell environment.
