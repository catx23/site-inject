export interface Options {
  close:string;
  // injected test application url
  url: string;

  // dynatrace front-end url
  dynatraceUrl: string;

  // dynatrace demo - dev url
  demoDevUrl: string;

  disableRequests: boolean;

}