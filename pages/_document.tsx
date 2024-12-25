import Document, { Head, Html, Main, NextScript } from 'next/document'

class MyDocument extends Document {
  render() {
    return (
      <Html lang="en">
        <Head>
        <link rel="icon" href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%2210 0 100 100%22><text y=%22.90em%22 font-size=%2290%22>📷</text></svg>"></link>
          <meta
            name="description"
            content="Explore a photography gallery"
          />
          <meta property="og:site_name" content="archivebyluana.vercel.app" />
          <meta
            property="og:description"
            content="Explore a photography gallery"
          />
          <meta property="og:title" content="Luana's gallery" />
          <meta name="twitter:card" content="summary_large_image" />
          <meta name="twitter:title" content="a photography gallery" />
          <meta
            name="twitter:description"
            content="Explore a photography gallery"
          />
        </Head>
        <body className="antialiased">
          <Main />
          <NextScript />
        </body>
      </Html>
    )
  }
}

export default MyDocument
