<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="2.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:sitemap="http://www.sitemaps.org/schemas/sitemap/0.9">

  <xsl:output method="html" indent="yes" encoding="UTF-8"/>

  <xsl:template match="/">
    <html lang="en">
      <head>
        <meta charset="UTF-8"/>
        <meta name="viewport" content="width=device-width, initial-scale=1"/>
        <title>Sitemap</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            font-size: 28px;
            margin: 28px;
            color: #111;
            background: #fff;
          }
          h1 {
            font-size: 40px;
            margin: 0 0 12px;
          }
          .count {
            margin: 0 0 20px;
            color: #666;
          }
          .list {
            display: flex;
            flex-direction: column;
            gap: 8px;
          }
          a {
            color: #1a56db;
            text-decoration: none;
            word-break: break-all;
          }
          a:hover {
            text-decoration: underline;
          }
        </style>
      </head>
      <body>
        <h1>Sitemap</h1>
        <p class="count">URLs: <xsl:value-of select="count(sitemap:urlset/sitemap:url)"/></p>
        <div class="list">
          <xsl:for-each select="sitemap:urlset/sitemap:url">
            <a href="{sitemap:loc}"><xsl:value-of select="sitemap:loc"/></a>
          </xsl:for-each>
        </div>
      </body>
    </html>
  </xsl:template>
</xsl:stylesheet>
