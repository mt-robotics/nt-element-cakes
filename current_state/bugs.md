# bugs — NT Element Cakes (open)

> Updated: 2026-08-16

1. **Messenger URL unverified.** `https://m.me/61592289277016` was inferred from the Facebook numeric page ID — never confirmed to actually open the page. Owner to test.
2. **Copy is placeholder.** Tagline "Handcrafted tiramisu, from Australia." and the about sentence are defaults in `config.ts` — owner to supply final copy.
3. **Cake count dropped 19 → 13.** Six photos disappeared during the Cloudinary folder-move attempts. Likely intentional deletion, but worth confirming none are missing that should be live.
4. **GH Actions "Node.js 20 is deprecated" warning.** Cosmetic — the `actions/*` runtime is being forced to Node 24; runs still pass. No action needed unless it becomes an error.
5. **Decorative 3D beans undecided.** The three floating beans are now non-interactive ambience. Owner hasn't decided keep vs remove.
