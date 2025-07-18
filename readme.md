# Elelem

A simple cross-platform LLM client.

![CodeRabbit](https://img.shields.io/coderabbit/prs/github/nazebzurati/elelem?utm_source=oss&utm_medium=github&utm_campaign=nazebzurati%2Felelem&labelColor=171717&color=6a3de8&link=https%3A%2F%2Fcoderabbit.ai&label=CodeRabbit+Reviews)
![Google Play](https://img.shields.io/badge/Google_Play-v0.3.0-6a3de8?style=flat&logo=googleplay&labelColor=171717)
![Flathub](https://img.shields.io/badge/Flathub-v0.3.0-6a3de8?style=flat&logo=flathub&labelColor=171717)

<a href='https://flathub.org/apps/net.fionix.elelem'><img height='40' alt='Download on Flathub' src='https://flathub.org/api/badge?locale=en'/></a>
<a href='https://play.google.com/store/apps/details?id=net.fionix.elelem'><img height='40' alt='Download on Play Store' src='misc\get-it-on-google-play.png'/></a>

If you encounter any issues, please report them [here](https://github.com/nazebzurati/elelem/issues). Additionally, feel free to request any necessary features [here](https://github.com/nazebzurati/elelem/issues).

## Known Issue

1. WebKitGTK's DMA-BUF Issue with NVIDIA Graphics Cards on Linux

    On Linux, users with NVIDIA graphics card may not able to start the application due to an issue related to DMA-BUF. The following suggestion disables the DMA-BUF renderer for WebKit.
    
    - For flatpak, set the environment variable when running the app:

      ```bash
      flatpak run --env="WEBKIT_DISABLE_DMABUF_RENDERER=1" net.fionix.elelem
      ```
    
    - Else, modify Elelem desktop entry file (`/usr/share/applications/Elelem.desktop`):
      
      ```bash
      Exec=elelem # Original line
      Exec=env WEBKIT_DISABLE_DMABUF_RENDERER=1 elelem # Updated line
      ```

    

## Installation

Elelem provides support for various standalone bundling formats, including Windows (.exe, .msi), Mac (.dmg), and Linux (.rpm, .AppImage, .deb, .flatpak). Download them from the [releases page](https://github.com/nazebzurati/elelem/releases).

## To Contribute

1. Set up your environment by installing Tauri along with node and Rust.

2. Use `npm run tauri dev` to start develop with a hot module replacement (HMR) build.