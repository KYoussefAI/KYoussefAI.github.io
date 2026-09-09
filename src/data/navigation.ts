import { projectArea, projects } from './projects';

export const navigation = [
  { label: 'Home', href: '/', number: '01', context: 'Overview' },
  { label: 'Work', href: '/work/', number: '02', context: 'Data systems & applied projects' },
  { label: 'Research', href: '/research/', number: '03', context: 'Academic & experimental explorations' },
  { label: 'About', href: '/about/', number: '04', context: 'The person behind the work' },
  { label: 'Background', href: '/background/', number: '05', context: 'Education & technical foundations' },
];

export function currentArea(pathname: string) {
  const path = pathname.split(/[?#]/)[0].replace(/\/+$/, '') || '/';
  const project = projects.find(item => path === `/projects/${item.slug}`);
  const parent = project ? `/${projectArea(project)}/` : path.startsWith('/projects/') ? '/work/' : undefined;
  return navigation.find(item => parent ? item.href === parent : item.href === '/' ? path === '/' : path === item.href.slice(0, -1) || path.startsWith(item.href));
}
