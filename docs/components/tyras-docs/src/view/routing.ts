export const getCurrentRoutingURL = () =>
  window.location.hash?.substring(1) ?? "";

export const logicalURL2ActualURL = (routeURL: string) => `#${routeURL}`;

export const actualURL2LogicalURL = (actualURL: string) =>
  actualURL.substring(1); // Remove #

export const afterNavigatingToURL = (routingURL: string) => {
  if (window.location.pathname !== "/") {
    window.location.pathname = "/";
  }

  // TODO use history API here.
  if (getCurrentRoutingURL() !== routingURL) {
    window.location.hash = routingURL;
  }
};
