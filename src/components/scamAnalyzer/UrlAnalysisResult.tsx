import { ReactNode } from 'react';
import { AnalysisResult } from './types';

interface UrlAnalysisResultProps {
  result: AnalysisResult;
}

interface InfoRowProps {
  label: string;
  value?: ReactNode;
  mono?: boolean;
}

const InfoRow = ({ label, value, mono = false }: InfoRowProps) => (
  <div className="space-y-1">
    <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">{label}</p>
    <p className={`text-sm text-gray-900 dark:text-gray-100 ${mono ? 'font-mono' : ''}`}>
      {value ?? <span className="text-gray-500 dark:text-gray-400">Not available</span>}
    </p>
  </div>
);

const StatCard = ({ label, value }: { label: string; value: ReactNode }) => (
  <div className="rounded border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900/40 p-4">
    <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">{label}</p>
    <p className="mt-2 text-base font-semibold text-gray-900 dark:text-gray-100">{value}</p>
  </div>
);

export default function UrlAnalysisResult({ result }: UrlAnalysisResultProps) {
  const threatStyles = {
    safe: {
      container: 'border-l-4 border-green-500 bg-white dark:bg-gray-900/40',
      badge: 'text-green-700 dark:text-green-200'
    },
    suspicious: {
      container: 'border-l-4 border-yellow-500 bg-white dark:bg-gray-900/40',
      badge: 'text-yellow-700 dark:text-yellow-200'
    },
    dangerous: {
      container: 'border-l-4 border-red-500 bg-white dark:bg-gray-900/40',
      badge: 'text-red-700 dark:text-red-200'
    }
  } as const;

  const threatCopy = {
    safe: 'No immediate threats were detected. Continue to monitor the domain for changes.',
    suspicious: 'We noticed unusual signals. Review the breakdown below before trusting the site.',
    dangerous: 'Multiple indicators point to a high-risk destination. Avoid interacting with this URL.'
  } as const;

  const level = (result.threatLevel as keyof typeof threatStyles) || 'dangerous';
  const selectedStyles = threatStyles[level] || threatStyles.dangerous;
  const selectedCopy = threatCopy[level] || threatCopy.dangerous;

  const networkTypes = result.network?.types
    ? Object.entries(result.network.types)
        .sort((a, b) => Number(b[1]) - Number(a[1]))
        .slice(0, 5)
    : [];

  const vulnerabilities = result.security?.vulnerabilities ?? [];
  const indicators = result.indicators ?? [];
  const cookieDetails = result.page?.cookieDetails ?? [];
  const consoleLogs = result.page?.consoleLogDetails ?? [];
  const externalLinks = result.page?.externalLinks ?? [];
  const technologies = result.technologies ?? [];
  const portData = result.security?.ports;

  return (
    <div className="space-y-6">
      <section className={`rounded-md border border-gray-200 dark:border-gray-700 p-5 ${selectedStyles.container}`}>
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <p className={`text-sm font-semibold uppercase tracking-wide ${selectedStyles.badge}`}>
              {result.verdict}
            </p>
            <h2 className="mt-2 text-xl font-semibold text-gray-900 dark:text-gray-100 break-all">
              {result.domain?.name || result.url}
            </h2>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400 break-all">{result.finalUrl}</p>
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            <p className="uppercase tracking-wide font-semibold">Security score</p>
            <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">{result.security?.score ?? '—'}</p>
          </div>
        </div>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <InfoRow label="IP address" value={result.domain?.ip || 'Hidden'} mono />
          <InfoRow label="Registrar" value={result.domain?.registrar || 'Unknown'} />
          <InfoRow label="Server country" value={result.domain?.country || 'Unknown'} />
          <InfoRow label="Last scan" value={result.scannedAt ? new Date(result.scannedAt).toLocaleString() : 'Unknown'} />
        </div>
        <p className="mt-4 text-sm text-gray-700 dark:text-gray-300">{selectedCopy}</p>
      </section>

      <section className="rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900/40 p-5">
        <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">Key findings</h3>
        <div className="mt-4 space-y-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-2">
              Threat indicators
            </p>
            {indicators.length > 0 ? (
              <ul className="space-y-1 text-sm text-gray-800 dark:text-gray-200">
                {indicators.map((item, idx) => (
                  <li key={idx} className="rounded border border-gray-200 dark:border-gray-700 px-3 py-2">
                    {item}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-600 dark:text-gray-400">No explicit indicators were recorded for this scan.</p>
            )}
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-2">
              Reported vulnerabilities
            </p>
            {vulnerabilities.length > 0 ? (
              <div className="space-y-2">
                {vulnerabilities.map((vuln, idx) => (
                  <div key={idx} className="rounded border border-gray-200 dark:border-gray-700 p-3">
                    <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{vuln.title}</p>
                    <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">{vuln.description}</p>
                    <span className="mt-2 inline-block rounded bg-gray-200 dark:bg-gray-700 px-2 py-0.5 text-xs font-semibold uppercase text-gray-700 dark:text-gray-200">
                      {vuln.severity}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-600 dark:text-gray-400">No vulnerabilities were reported.</p>
            )}
          </div>
        </div>
      </section>

      <section className="grid gap-6 md:grid-cols-2">
        <div className="rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900/40 p-5 space-y-4">
          <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">Domain & hosting</h3>
          <InfoRow label="Domain Age" value={result.domain?.age ? `${result.domain.age} days` : 'Unknown'} />
          <InfoRow label="Registrar" value={result.domain?.registrar || 'Unknown'} />
          <InfoRow label="Nameservers" value={result.domain?.nameServers?.join(', ') || 'Unknown'} />
          <InfoRow label="Page Title" value={result.page?.title || 'No title detected'} />
        </div>

        <div className="rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900/40 p-5 space-y-4">
          <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">Security & encryption</h3>
          <InfoRow label="SSL Issuer" value={result.security?.ssl?.issuer || 'Unknown issuer'} />
          <InfoRow label="Validity" value={result.security?.ssl?.valid ? 'Certificate looks valid' : 'Invalid or missing certificate'} />
          {result.security?.ssl?.daysRemaining !== undefined && (
            <InfoRow label="Days until expiry" value={result.security.ssl.daysRemaining} />
          )}
          {result.security?.headersAnalysis && (
            <InfoRow
              label="Security headers"
              value={
                <>
                  Present: {result.security.headersAnalysis.present?.length ?? 0} • Missing: {result.security.headersAnalysis.missing?.length ?? 0} • Weak: {result.security.headersAnalysis.weak?.length ?? 0}
                </>
              }
            />
          )}
        </div>
      </section>

      <section className="rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900/40 p-5 space-y-6">
        <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">Network & page activity</h3>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Requests" value={result.network?.requests ?? 0} />
          <StatCard
            label="Transfer size (MB)"
            value={result.network?.bytes ? (result.network.bytes / 1024 / 1024).toFixed(2) : '0.00'}
          />
          <StatCard label="Cookies set" value={result.page?.cookies ?? 0} />
          <StatCard label="Console logs" value={result.page?.consoleLogs ?? 0} />
        </div>

        {networkTypes.length > 0 && (
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-2">
              Top resource types
            </p>
            <div className="space-y-2">
              {networkTypes.map(([type, count]) => (
                <div key={type} className="flex items-center gap-3 text-sm">
                  <span className="w-24 text-gray-600 dark:text-gray-400">{type}</span>
                  <div className="h-1.5 flex-1 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
                    <div
                      className="h-full bg-blue-500"
                      style={{
                        width: `${Math.min(100, (Number(count) / (result.network?.requests || 1)) * 100)}%`
                      }}
                    />
                  </div>
                  <span className="w-10 text-right text-gray-900 dark:text-gray-100">{count}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-2">
          <StatCard label="Forms detected" value={result.page?.forms ?? 0} />
          <StatCard label="Iframes detected" value={result.page?.iframes ?? 0} />
          <StatCard label="Scripts" value={result.page?.scripts?.length ?? 0} />
          <StatCard label="External links" value={result.page?.externalLinks?.length ?? 0} />
        </div>
      </section>

      <section className="grid gap-6 md:grid-cols-2">
        <div className="rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900/40 p-5">
          <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">Cookie security</h3>
          {result.security?.cookies ? (
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <StatCard label="Total cookies" value={result.security.cookies.total} />
              <StatCard label="Secure flag" value={result.security.cookies.secure} />
              <StatCard label="HttpOnly flag" value={result.security.cookies.httpOnly} />
              <StatCard label="SameSite" value={result.security.cookies.sameSite} />
            </div>
          ) : (
            <p className="mt-3 text-sm text-gray-600 dark:text-gray-400">No cookie data recorded.</p>
          )}
          {cookieDetails.length > 0 && (
            <div className="mt-4 space-y-2 max-h-48 overflow-y-auto">
              {cookieDetails.map((cookie, idx) => (
                <div key={idx} className="rounded border border-gray-200 dark:border-gray-700 p-3 text-xs">
                  <p className="font-mono text-sm text-gray-900 dark:text-gray-100">{cookie.name}</p>
                  <div className="mt-2 flex flex-wrap gap-2 text-gray-600 dark:text-gray-400">
                    {cookie.secure && <span>Secure</span>}
                    {cookie.httpOnly && <span>HttpOnly</span>}
                    {cookie.sameSite && <span>SameSite: {cookie.sameSite}</span>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900/40 p-5">
          <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">Mixed content & ports</h3>
          {result.security?.mixedContent && result.security.mixedContent.count > 0 ? (
            <div className="mt-4 space-y-2">
              <p className="text-sm text-gray-700 dark:text-gray-300">
                {result.security.mixedContent.count} HTTP resource(s) loaded on an HTTPS page.
              </p>
              <div className="max-h-32 overflow-y-auto text-xs space-y-1">
                {result.security.mixedContent.resources.map((resource, idx) => (
                  <div key={idx} className="rounded border border-gray-200 dark:border-gray-700 px-2 py-1 font-mono break-all">
                    {resource}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="mt-3 text-sm text-gray-600 dark:text-gray-400">No mixed content detected.</p>
          )}

          {portData && (portData.secure.length > 0 || portData.weak.length > 0) && (
            <div className="mt-4 space-y-3 text-sm">
              {portData.weak.length > 0 && (
                <div>
                  <p className="font-semibold text-gray-900 dark:text-gray-100">Weak ports</p>
                  <div className="mt-1 flex flex-wrap gap-2">
                    {portData.weak.map((port, idx) => (
                      <span key={idx} className="rounded border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 px-3 py-1">
                        {port.name} ({port.port})
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {portData.secure.length > 0 && (
                <div>
                  <p className="font-semibold text-gray-900 dark:text-gray-100">Secure ports</p>
                  <div className="mt-1 flex flex-wrap gap-2">
                    {portData.secure.map((port, idx) => (
                      <span key={idx} className="rounded border border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20 px-3 py-1">
                        {port.name} ({port.port})
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      <section className="rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900/40 p-5">
        <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">Technologies & content</h3>
        {technologies.length > 0 ? (
          <ul className="mt-4 grid gap-2 sm:grid-cols-2">
            {technologies.map((tech, idx) => (
              <li key={idx} className="rounded border border-gray-200 dark:border-gray-700 px-3 py-2 text-sm text-gray-900 dark:text-gray-100">
                <span className="font-semibold">{tech.name}</span>
                {tech.type && <span className="text-gray-500 dark:text-gray-400"> • {tech.type}</span>}
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-3 text-sm text-gray-600 dark:text-gray-400">No identifiable technologies were detected.</p>
        )}

        {externalLinks.length > 0 && (
          <div className="mt-6">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-2">
              Sample external links
            </p>
            <div className="space-y-2 max-h-40 overflow-y-auto text-xs">
              {externalLinks.slice(0, 8).map((link, idx) => (
                <div key={idx} className="rounded border border-gray-200 dark:border-gray-700 p-2">
                  <p className="break-all text-blue-600 dark:text-blue-400">{link.url}</p>
                  {link.text && <p className="mt-1 text-gray-600 dark:text-gray-400 truncate">{link.text}</p>}
                </div>
              ))}
            </div>
          </div>
        )}

        {consoleLogs.length > 0 && (
          <div className="mt-6">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-2">
              Console log excerpts
            </p>
            <div className="max-h-40 overflow-y-auto space-y-2 text-xs">
              {consoleLogs.map((log, idx) => (
                <div
                  key={idx}
                  className="rounded border border-gray-200 dark:border-gray-700 p-2"
                >
                  <span className="font-semibold text-gray-900 dark:text-gray-100">{log.type}:</span> {log.text}
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      {result.screenshot && (
        <section className="rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900/40">
          <div className="border-b border-gray-200 dark:border-gray-700 px-5 py-3">
            <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">Captured screenshot</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 break-all">{result.finalUrl}</p>
          </div>
          <img src={result.screenshot} alt="Scanned page preview" className="w-full rounded-b-lg object-cover" />
        </section>
      )}
    </div>
  );
}
