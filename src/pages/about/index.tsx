import Navbar from "./navbar";

export default function About() {
  return (
    <div>
      {/* navbar */}
      <Navbar />
      {/* title */}
      <div className="px-7 py-4 space-y-4 not-sm:pb-18 sm:mx-auto sm:mt-10 sm:max-w-sm">
        <p className="text-justify">
          This tool is free to use because it connects to your own LLM or API
          key. The developer created it as a productivity tools and enjoys
          making it available to others.
        </p>
        <p className="text-justify">
          If you find it helpful, consider supporting its continued development
          with a{" "}
          <a
            className="link"
            target="_blank"
            rel="noreferrer"
            href="https://ko-fi.com/nazebzurati"
          >
            donation
          </a>
          . You can also report any{" "}
          <a
            className="link"
            target="_blank"
            rel="noreferrer"
            href="https://github.com/nazebzurati/elelem/issues"
          >
            issues
          </a>{" "}
          to help improve the tool.
        </p>
        <p className="text-justify">
          This application is provided without any warranty. For more
          information, please refer to the{" "}
          <a
            className="link"
            target="_blank"
            rel="noreferrer"
            href="https://github.com/nazebzurati/elelem/blob/main/license.md"
          >
            GNU General Public License version 3 or later.
          </a>
        </p>
        <p className="pt-4 text-sm">© 2025 Nazeb Zurati</p>
      </div>
    </div>
  );
}
