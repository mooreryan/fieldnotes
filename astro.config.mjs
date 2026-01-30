// @ts-check
import { defineConfig } from "astro/config";
import starlight from "@astrojs/starlight";

// https://astro.build/config
export default defineConfig({
  integrations: [
    starlight({
      title: "Field Notes",
      social: [
        {
          icon: "github",
          label: "GitHub",
          href: "https://github.com/mooreryan/fieldnotes",
        },
      ],
      sidebar: [
        {
          label: "Gleam",
          autogenerate: { directory: "gleam" },
        },
        {
          label: "Uncategorized",
          autogenerate: { directory: "uncategorized" },
        },
      ],
      pagination: false,
    }),
  ],
});
