insert into request_categories (slug,label) values
('health','Salud'),('education','Educación'),('business','Emprendimientos'),('utilities','Servicios básicos'),('housing','Vivienda')
on conflict (slug) do nothing;