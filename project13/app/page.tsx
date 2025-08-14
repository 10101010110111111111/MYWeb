"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Upload, Download, Package, Terminal } from "lucide-react"
import Link from "next/link"

export default function HomePage() {
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    setIsLoaded(true)
  }, [])

  const recentPackages = [
    { name: "react-utils", author: "dev_user", time: "2h ago", downloads: 42 },
    { name: "api-helpers", author: "coder123", time: "4h ago", downloads: 18 },
    { name: "config-files", author: "sysadmin", time: "6h ago", downloads: 73 },
    { name: "scripts-bundle", author: "automation", time: "8h ago", downloads: 29 },
    { name: "docker-setup", author: "devops_pro", time: "12h ago", downloads: 156 },
    { name: "test-data", author: "qa_engineer", time: "1d ago", downloads: 91 },
  ]

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100">
      <header className="border-b border-gray-700 bg-gray-800">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Terminal className="h-6 w-6 text-green-400" />
              <span className="text-xl font-mono text-green-400">sender</span>
            </div>
            <div className="flex gap-3">
              <Link href="/auth/login">
                <Button variant="outline" className="border-gray-600 text-gray-300 hover:bg-gray-700 bg-transparent">
                  login
                </Button>
              </Link>
              <Link href="/auth/register">
                <Button className="bg-green-600 hover:bg-green-700 text-black">register</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl font-mono text-green-400 mb-4">$ sender --help</h1>
          <p className="text-gray-400 mb-8 font-mono">Fast file sharing for developers. Upload, share, download.</p>

          <div className="grid md:grid-cols-3 gap-4 max-w-2xl mx-auto">
            <Link href="/upload">
              <Button className="w-full h-16 bg-blue-600 hover:bg-blue-700 text-white flex flex-col gap-1">
                <Upload className="h-6 w-6" />
                <span className="font-mono">upload</span>
              </Button>
            </Link>
            <Link href="/retrieve">
              <Button className="w-full h-16 bg-purple-600 hover:bg-purple-700 text-white flex flex-col gap-1">
                <Download className="h-6 w-6" />
                <span className="font-mono">retrieve</span>
              </Button>
            </Link>
            <Link href="/packages">
              <Button className="w-full h-16 bg-orange-600 hover:bg-orange-700 text-white flex flex-col gap-1">
                <Package className="h-6 w-6" />
                <span className="font-mono">packages</span>
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <section className="py-12 px-4 bg-gray-800">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl font-mono text-green-400 mb-6 flex items-center gap-2">
            <span className="text-gray-500">$</span> ls recent_packages/
          </h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {recentPackages.map((pkg, index) => (
              <Card key={index} className="bg-gray-700 border-gray-600 hover:border-green-400 transition-colors">
                <CardHeader className="pb-3">
                  <CardTitle className="font-mono text-lg text-green-400 flex items-center gap-2">
                    <Package className="h-4 w-4" />
                    {pkg.name}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm font-mono">
                    <div className="text-gray-400">
                      author: <span className="text-blue-400">{pkg.author}</span>
                    </div>
                    <div className="text-gray-400">
                      uploaded: <span className="text-yellow-400">{pkg.time}</span>
                    </div>
                    <div className="text-gray-400">
                      downloads: <span className="text-purple-400">{pkg.downloads}</span>
                    </div>
                  </div>
                  <Button size="sm" className="w-full mt-4 bg-gray-600 hover:bg-gray-500 text-white font-mono">
                    download
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <footer className="border-t border-gray-700 bg-gray-800 py-8">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <p className="text-gray-500 font-mono text-sm">sender v1.0.0 | built for developers</p>
        </div>
      </footer>
    </div>
  )
}
