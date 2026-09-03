
GRANT INSERT ON public.continents, public.countries, public.articles, public.travel_routes, public.products TO anon;
CREATE POLICY "temp seed continents" ON public.continents FOR INSERT WITH CHECK (true);
CREATE POLICY "temp seed countries" ON public.countries FOR INSERT WITH CHECK (true);
CREATE POLICY "temp seed articles" ON public.articles FOR INSERT WITH CHECK (true);
CREATE POLICY "temp seed routes" ON public.travel_routes FOR INSERT WITH CHECK (true);
CREATE POLICY "temp seed products" ON public.products FOR INSERT WITH CHECK (true);
