import { Disclosure } from '@headlessui/react'
import { Bars3Icon, Cog8ToothIcon, XMarkIcon } from '@heroicons/react/24/outline'
import { Link, NavLink } from 'react-router-dom'

const navigation = [
  { name: 'My plants', href: '/', current: true },
  { name: 'Schedule', href: '/schedule', current: false },
]

function classNames(...classes: string[]): string {
  return classes.filter(Boolean).join(' ')
}
export function Navigation() {
  return (
    <Disclosure as="nav" className="bg-gray-800">
      {({ open, close }) => (
        <>
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex h-16 items-center justify-between">
              <div className="flex flex-1 items-center">
                <div className="flex-shrink-0">
                  <Link to="/">
                    <img
                      className="h-8 w-8"
                      src="/drop.svg"
                      alt="Your Company"
                    />
                  </Link>
                </div>
                <div className="flex-shrink-0 text-2xl text-slate-200">
                  Watering Can
                </div>
                <div className="hidden md:block">
                  <div className="ml-10 flex items-baseline space-x-4">
                    {navigation.map((item) => (
                      <NavLink
                        key={item.name}
                        to={item.href}
                        className={({ isActive }) => {
                          return classNames(
                            isActive
                              ? "bg-gray-900 text-white"
                              : "text-gray-300 hover:bg-gray-700 hover:text-white",
                            'rounded-md px-3 py-2 text-sm font-medium'
                          )
                        }
                        }
                        aria-current={item.current ? 'page' : undefined}
                      >
                        {item.name}
                      </NavLink>
                    ))}
                  </div>
                </div>
              </div>
              <div className="">
                <div className="ml-4 flex items-center md:ml-6">
                  <div className="relative rounded-full bg-gray-800 p-1 text-gray-400 hover:text-white focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800">
                    <NavLink to="/preferences">
                      <Cog8ToothIcon className="h-6 w-6" aria-hidden="true" />
                    </NavLink>
                  </div>
                </div>
              </div>
              <div className="-mr-2 flex md:hidden">
                {/* Mobile menu button */}
                <Disclosure.Button className="relative inline-flex items-center justify-center rounded-md bg-gray-800 p-2 text-gray-400 hover:bg-gray-700 hover:text-white focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800">
                  <span className="absolute -inset-0.5" />
                  <span className="sr-only">Open main menu</span>
                  {open ? (
                    <XMarkIcon className="block h-6 w-6" aria-hidden="true" />
                  ) : (
                    <Bars3Icon className="block h-6 w-6" aria-hidden="true" />
                  )}
                </Disclosure.Button>
              </div>
            </div>
          </div>

          <Disclosure.Panel className="md:hidden fixed bg-gray-800 w-full shadow-2xl">
            <div className="space-y-1 px-2 pb-3 pt-2 sm:px-3">
              {navigation.map((item) => (
                <NavLink
                  key={item.name}
                  onClick={() => {close()}}
                  to={item.href}
                  className={({ isActive }) => {
                    return classNames(
                      isActive
                        ? "bg-gray-900 text-white"
                        : "text-gray-300 hover:bg-gray-700 hover:text-white",
                      'block rounded-md px-3 py-2 text-base font-medium'
                    )
                  }}
                  aria-current={item.current ? 'page' : undefined}
                >
                  {item.name}
                </NavLink>
              ))}
            </div>
          </Disclosure.Panel>
        </>
      )}
    </Disclosure>
  )
}