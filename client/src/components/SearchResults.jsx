import React from "react";
import { Virtuoso, VirtuosoGrid } from "react-virtuoso";

/**
 * SearchResults Component
 * Virtualized search results renderer powered by react-virtuoso.
 * Calculates scroll position and dynamically renders only items visible in the viewport,
 * recycling DOM nodes to guarantee 60fps scrolling performance.
 */
const SearchResults = ({
  items = [],
  renderItem,
  useWindowScroll = true,
  layout = "grid", // "grid" | "list"
  overscan = 300,
  loading = false,
  emptyState = null,
  header = null,
  footer = null,
  className = "",
}) => {
  if (loading) {
    return null; // Handled by caller's skeleton loader
  }

  if (!items || items.length === 0) {
    return emptyState ? (
      <>{emptyState}</>
    ) : (
      <div className="rounded-3xl border-2 border-dashed border-slate-200 bg-slate-50 py-16 text-center dark:border-slate-700 dark:bg-slate-800/50">
        <p className="text-lg font-bold text-slate-700 dark:text-slate-300">
          No results found
        </p>
      </div>
    );
  }

  // Grid layout custom components for VirtuosoGrid
  const gridComponents = {
    List: React.forwardRef(({ style, children, ...props }, ref) => (
      <div
        ref={ref}
        {...props}
        style={style}
        className={`grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 ${className}`}
      >
        {children}
      </div>
    )),
    Item: ({ children, ...props }) => (
      <div {...props} className="h-full flex flex-col">
        {children}
      </div>
    ),
  };

  if (layout === "grid") {
    return (
      <VirtuosoGrid
        useWindowScroll={useWindowScroll}
        totalCount={items.length}
        overscan={overscan}
        components={gridComponents}
        itemContent={(index) => {
          const item = items[index];
          return renderItem ? renderItem(item, index) : null;
        }}
        componentsHeader={header ? () => <>{header}</> : undefined}
        componentsFooter={footer ? () => <>{footer}</> : undefined}
      />
    );
  }

  return (
    <Virtuoso
      useWindowScroll={useWindowScroll}
      data={items}
      overscan={overscan}
      className={className}
      itemContent={(index, item) => (
        <div className="pb-4">
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

export default SearchResults;
