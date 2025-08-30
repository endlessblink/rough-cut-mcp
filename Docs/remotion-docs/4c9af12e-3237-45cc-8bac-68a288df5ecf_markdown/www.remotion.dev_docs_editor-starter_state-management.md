[Skip to main content](https://www.remotion.dev/docs/editor-starter/state-management#__docusaurus_skipToContent_fallback)

On this page

State in the [Editor Starter](https://www.remotion.dev/docs/editor-starter) is managed with the built-in React state management utilities: [`useState()`](https://react.dev/reference/react/useState) and [`useContext()`](https://react.dev/reference/react/useContext).

Why?

The Editor Starter was built in a way that as many different teams can adopt it as easily as possible.

We chose to use React's native state management to keep the starter kit lightweight, minimize external dependencies, and leverage familiar patterns for developers already comfortable with React.

While the default React state management utilities are controversial for some, any React application can make use of them and developers are most familiar with them.

## Shape [​](https://www.remotion.dev/docs/editor-starter/state-management\#shape "Direct link to Shape")

The whole state of the Editor Starter is stored in a single object with the shape defined by the [`EditorState`](https://github.com/search?q=repo%3Aremotion-dev%2Feditor-starter%20type%20EditorState&type=code).

```

src/editor/state/types.ts
ts

type DeletedAsset = {
  remoteUrl: string | null;
  remoteFileKey: string | null;
  assetId: string;
  statusAtDeletion: AssetState;
};

export type UndoableState = {
  tracks: TrackType[];
  assets: Record<string, EditorStarterAsset>;
  items: Record<string, EditorStarterItem>;
  fps: number;
  compositionWidth: number;
  compositionHeight: number;
  deletedAssets: DeletedAsset[];
};

export type EditorState = {
  undoableState: UndoableState;
  selectedItems: string[];
  textItemEditing: string | null;
  textItemHoverPreview: TextItemHoverPreview | null;
  renderingTasks: RenderingTask[];
  captioningTasks: CaptioningTask[];
  initialized: boolean;
  itemsBeingTrimmed: ItemBeingTrimmed[];
  loop: boolean;
  assetStatus: Record<string, AssetState>;
};
```

- [`undoableState`](https://www.remotion.dev/docs/editor-starter/state-management#undoable-state) \- State that is affected by the undo stack:
  - `tracks`: An array of [timeline tracks](https://www.remotion.dev/docs/editor-starter/tracks-items-assets), the last ones are the ones rendered in the back.
  - `assets`: A map of all [assets](https://www.remotion.dev/docs/editor-starter/tracks-items-assets) that have been uploaded to the editor.
  - `items`: A map of all [items](https://www.remotion.dev/docs/editor-starter/tracks-items-assets) that have been added to the editor.
  - `fps`: The frame rate (kept in state, [but by default no UI is exposed to change it](https://www.remotion.dev/docs/editor-starter/features-not-included#multiple-frame-rates)).
  - `compositionWidth`: The width of the canvas.
  - `compositionHeight`: The height of the canvas.
  - `deletedAssets`: An array of assets [that have been deleted](https://www.remotion.dev/docs/editor-starter/asset-cleanup).
- `selectedItems`: An array of item IDs that are currently selected.
- `textItemEditing`: The ID of the text item that is currently being edited, if there is one.
- `textItemHoverPreview`: Preview updates of a text item (for example if a font is hovered in the font picker, the text will render temporarily with the font hovered).
- `renderingTasks`: The state of the rendering process.
- `captioningTasks`: The state of captioning process.
- `initialized`: Whether the editor has been initialized, if not initialized, canvas will not be visible.
- `itemsBeingTrimmed`: An array of items that are currently being trimmed, to show an indication of the maximum trim that is possible.
- `loop`: Whether the playback should loop.
- `assetStatus`: A map of asset IDs to their upload status, which can be:
  - `pending-upload`: The asset is currently being uploaded.
  - `uploaded`: The asset has been uploaded successfully.
  - `error`: The asset upload has failed.
  - `in-progress`: The asset has not been uploaded yet.

## Undoable state [​](https://www.remotion.dev/docs/editor-starter/state-management\#undoable-state "Direct link to Undoable state")

State is separated into undoable and non-undoable parts.

Undoable state is located within the `undoableState` object of the root state.

**Undoable state** might be:

- Position, size and other properties of an item
- Assets and tracks
- Video properties like dimensions and frame rate

**Non-undoable state** might be:

- Asset upload progress and status
- Captioning progress
- Zoom level
- Rendering state
- Selection state

See also: [Undo and Redo](https://www.remotion.dev/docs/editor-starter/undo-redo)

## Contexts [​](https://www.remotion.dev/docs/editor-starter/state-management\#contexts "Direct link to Contexts")

In [`src/editor-context-provider.tsx`](https://github.com/remotion-dev/editor-starter/blob/main/src/editor/context-provider.tsx), you will see a very deeply nested tree of various context providers.

This is intentional and achieves that when updating a portion of the state, only the components that are dependent on that portion of the state will re-render, while the rest of the components will not.

For the best performance, we recommend that you continue to use this pattern in your own application.

## Preventing state updates when nothing has changed [​](https://www.remotion.dev/docs/editor-starter/state-management\#preventing-state-updates-when-nothing-has-changed "Direct link to Preventing state updates when nothing has changed")

You should prevent an unnecessary state update when nothing has changed.

- This is better for performance
- [This will prevent adding a snapshot to the undo stack, which would lead to clicking the undo button once with no effect](https://www.remotion.dev/docs/editor-starter/undo-redo#preventing-unnecessary-additions-to-the-undo-stack)

Throughout the codebase, you will see checks that prevent an unnecessary state update.

```

Preventing an identity change
ts

export const markAsDragging = (state: EditorState, itemId: string): EditorState => {
  return changeItem(state, itemId, (item) => {
    if (item.isDragging) {
      // The item would not change, so we return the original object
      return item;
    }

    return {
      ...item,
      isDragging: true,
    };
  });
};
```

## Reading the state imperatively [​](https://www.remotion.dev/docs/editor-starter/state-management\#reading-the-state-imperatively "Direct link to Reading the state imperatively")

If you only need to access the state upon an interaction, you can use the [`useCurrentStateAsRef()`](https://github.com/search?q=repo%3Aremotion-dev%2Feditor-starter%20const%20useCurrentStateAsRef&type=code) hook.

It allows you to imperatively access the state when you need it.

You cannot build a reactive UI with it, but is more performant than using a hook that re-renders when the state changes.

For example: A save button that only needs to access the state when the user clicks it.

## See also [​](https://www.remotion.dev/docs/editor-starter/state-management\#see-also "Direct link to See also")

- [Undo and Redo](https://www.remotion.dev/docs/editor-starter/undo-redo)

- [Shape](https://www.remotion.dev/docs/editor-starter/state-management#shape)
- [Undoable state](https://www.remotion.dev/docs/editor-starter/state-management#undoable-state)
- [Contexts](https://www.remotion.dev/docs/editor-starter/state-management#contexts)
- [Preventing state updates when nothing has changed](https://www.remotion.dev/docs/editor-starter/state-management#preventing-state-updates-when-nothing-has-changed)
- [Reading the state imperatively](https://www.remotion.dev/docs/editor-starter/state-management#reading-the-state-imperatively)
- [See also](https://www.remotion.dev/docs/editor-starter/state-management#see-also)

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