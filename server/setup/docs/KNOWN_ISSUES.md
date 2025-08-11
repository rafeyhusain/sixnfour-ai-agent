# Known Issues

Here is a list of known issues in user interface (admin dashboard) and server.

## Admin App Issues

### Settings

- ai-marketing-agent\client\admin\eslint.config.mjs
- ai-marketing-agent\client\admin\next.config.ts

### Issues

- dashboard, calender, post, media is incomplete

#### Build errors

./app/dashboard/calendar/page.tsx
28:6  Warning: React Hook useEffect has a missing dependency: 'date'. Either include it or remove the dependency array.  react-hooks/exhaustive-deps

./app/dashboard/generate/page.tsx
25:24  Warning: 'setIsGenerating' is assigned a value but never used.  @typescript-eslint/no-unused-vars
26:20  Warning: 'setProgress' is assigned a value but never used.  @typescript-eslint/no-unused-vars
27:23  Warning: 'setCurrentStep' is assigned a value but never used.  @typescript-eslint/no-unused-vars
28:26  Warning: 'setGeneratedPosts' is assigned a value but never used.  @typescript-eslint/no-unused-vars
41:6  Warning: React Hook useEffect has a missing dependency: 'checkExistingPostsForMonth'. Either include it or remove the dependency array.  react-hooks/exhaustive-deps
51:14  Warning: 'error' is defined but never used.  @typescript-eslint/no-unused-vars
291:78  Error: `'` can be escaped with `&apos;`, `&lsquo;`, `&#39;`, `&rsquo;`.  react/no-unescaped-entities

./app/dashboard/page.tsx
4:29  Warning: 'CardHeader' is defined but never used.  @typescript-eslint/no-unused-vars
4:41  Warning: 'CardTitle' is defined but never used.  @typescript-eslint/no-unused-vars
12:10  Warning: 'format' is defined but never used.  @typescript-eslint/no-unused-vars
94:20  Error: `'` can be escaped with `&apos;`, `&lsquo;`, `&#39;`, `&rsquo;`.  react/no-unescaped-entities

./app/dashboard/posts/page.tsx
186:10  Warning: 'DatePicker' is defined but never used.  @typescript-eslint/no-unused-vars
191:16  Warning: 'setDate' is assigned a value but never used.  @typescript-eslint/no-unused-vars

./components/campaign/campaign-editor.tsx
17:60  Warning: 'DialogFooter' is defined but never used.  @typescript-eslint/no-unused-vars
17:74  Warning: 'DialogClose' is defined but never used.  @typescript-eslint/no-unused-vars
41:10  Warning: 'campaignId' is assigned a value but never used.  @typescript-eslint/no-unused-vars
150:6  Warning: React Hook useEffect has a missing dependency: 'campaign.recurrence'. Either include it or remove the dependency array.  react-hooks/exhaustive-deps
164:55  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
168:92  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./components/campaign/campaign-media-manager.tsx
40:9  Warning: 'handleMediaSelection' is assigned a value but never used.  @typescript-eslint/no-unused-vars
79:9  Warning: 'handleMultiSelectDone' is assigned a value but never used.  @typescript-eslint/no-unused-vars
89:9  Warning: 'handleMultiSelectCancel' is assigned a value but never used.  @typescript-eslint/no-unused-vars
104:9  Warning: 'availableMedia' is assigned a value but never used.  @typescript-eslint/no-unused-vars

./components/dashboard/RecentPosts.tsx
67:25  Warning: Image elements must have an alt prop, either with meaningful text, or an empty string for decorative images.  jsx-a11y/alt-text

./components/dashboard/types/index.ts
128:23  Warning: 'sort' is assigned a value but never used.  @typescript-eslint/no-unused-vars

./components/item-editor.tsx
7:52  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
11:53  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./components/table-editor/components/button-save.tsx
8:27  Warning: 'TData' is defined but never used.  @typescript-eslint/no-unused-vars

./components/table-editor/components/row-actions.tsx
27:10  Warning: 'DashboardService' is defined but never used.  @typescript-eslint/no-unused-vars
42:30  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
45:38  Warning: 'campaign' is defined but never used.  @typescript-eslint/no-unused-vars

./components/table-editor/json-editor.tsx
44:6  Warning: React Hook useEffect has a missing dependency: 'form'. Either include it or remove the dependency array.  react-hooks/exhaustive-deps

./components/table-editor/model/columns.tsx
43:10  Warning: 'isJson' is defined but never used.  @typescript-eslint/no-unused-vars

./components/table-editor/model/filters.tsx
6:52  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./components/table-editor/model/schema.ts
9:20  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
23:49  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./components/wingui/media-gallery/file-upload.tsx

./components/wingui/media-gallery/media-grid.tsx
58:9  Warning: 'someFilteredSelected' is assigned a value but never used.  @typescript-eslint/no-unused-vars

./components/wingui/sidebar/app-sidebar.tsx
124:10  Warning: 'error' is assigned a value but never used.  @typescript-eslint/no-unused-vars
125:36  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
137:21  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

info  - Need to disable some ESLint rules? Learn more here: <https://nextjs.org/docs/app/api-reference/config/eslint#disabling-rules>

## Server Issues

Following features are either work in progress or have issues:

- lead partially implemented
- upload image api not tested
- schedules status is not stored correctly, includes logger which is incorrect
- isDue is not calculated correctly for generation and publishing
- Campaign Post Scheduling Engine for recurring events
- Campaign Post Generation Engine for recurring events
- Campaign Post Publishing Engine for recurring events
- Edit Campaign events from UI (In progress)
- Enter and test one time event through Dashboard UI
- Connect recurring events Dashboard UI to these engines using Calendar UI
- End to end testing
- Connect SixNFour Facebook and Instagram to Publishing Engine
- Developer Tiktok support
- Dashboard statistics and restaurant setup
- Logs UI
- Start/Stop Scheduling, Generation and Publishing Engine
- Edit Generated Posts
