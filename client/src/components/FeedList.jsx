import React from "react";
import { Virtuoso } from "react-virtuoso";

/**
 * FeedList Component
 * Optimized DOM virtualized feed renderer powered by react-virtuoso.
 * Used for provider job feeds, activity lists, and event streams.
 * Maintains minimal active DOM node count during infinite scrolling.
 */
const FeedList = ({
  items = [],
  renderItem,
  useWindowScroll = true,
  overscan = 300,
  loading = false,
  emptyState = null,
  header = null,
  footer = null,
  className = "",
  itemClassName = "pb-4",
}) => {
  if (loading) {
    return null;
  }

  if (!items || items.length === 0) {
    return emptyState ? (
      <>{emptyState}</>
    ) : (
      <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 py-16 text-center text-slate-500 dark:border-slate-700 dark:bg-slate-800/50 dark:text-slate-400">
        <p className="font-semibold">Feed is empty</p>
      </div>
    );
  }

  return (
    <Virtuoso
      useWindowScroll={useWindowScroll}
      data={items}
      overscan={overscan}
      className={className}
      itemContent={(index, item) => (
        <div className={itemClassName}>
          {renderItem ? renderItem(item, index) : null}
        </div>
      )}
      components={{
        Header: header ? () => <>{header}</> : undefined,
        Footer: footer ? () => <>{footer}</> : undefined,
      }}
    />
  );
};

export default FeedList;
