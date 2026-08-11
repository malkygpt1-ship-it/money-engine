import type { MetadataRoute } from "next";

export default function robots():MetadataRoute.Robots{
 const base=process.env.NEXT_PUBLIC_APP_URL||"https://money-engine-omega.vercel.app";
 return {rules:[{userAgent:"*",allow:["/shop","/offers/"],disallow:["/api/","/delivery","/opportunities","/skills","/agents","/factory","/revenue"]}],sitemap:`${base}/sitemap.xml`};
}
