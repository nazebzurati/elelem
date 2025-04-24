# Elelem

A simple cross-platform LLM client.

![CodeRabbit Pull Request Reviews](https://img.shields.io/coderabbit/prs/github/nazebzurati/elelem?utm_source=oss&utm_medium=github&utm_campaign=nazebzurati%2Felelem&labelColor=171717&color=FF570A&link=https%3A%2F%2Fcoderabbit.ai&label=CodeRabbit+Reviews)

If you encounter any issues, please report them promptly [here](https://github.com/nazebzurati/elelem/issues). Additionally, feel free to request any necessary features [here](https://github.com/nazebzurati/elelem/issues).

## Known Issue

### WebKitGTK's DMA-BUF Issue with NVIDIA Graphics Cards on Linux

On Linux, users with NVIDIA graphics card may not able to start the application due to an issue related to DMA-BUF. To resolve this, modify Elelem desktop entry file (`/usr/share/applications/Elelem.desktop`) by updating as follows:

```bash
Exec=elelem # Original line
Exec=env WEBKIT_DISABLE_DMABUF_RENDERER=1 elelem # Updated line
```

This change disables the DMA-BUF renderer for WebKit.

## Installation

Elelem provides support for various standalone bundling formats, including Windows (.exe, .msi), Mac (.dmg), and Linux (.rpm, .AppImage, .deb, .flatpak). Download them from the [releases page](https://github.com/nazebzurati/elelem/releases).

## To Contribute

1. Set up your environment by installing Tauri along with Deno and Rust.

2. Use `deno run tauri dev` to start develop with a hot module replacement (HMR) build.