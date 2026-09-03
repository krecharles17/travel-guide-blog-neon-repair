
DROP POLICY "temp seed continents" ON public.continents;
DROP POLICY "temp seed countries" ON public.countries;
DROP POLICY "temp seed articles" ON public.articles;
DROP POLICY "temp seed routes" ON public.travel_routes;
DROP POLICY "temp seed products" ON public.products;
REVOKE INSERT ON public.continents, public.countries, public.articles, public.travel_routes, public.products FROM anon;
