describe('use-view-encapsulation', () => {
  describe('invalid view encapsulation', () => {
    it('should fail if ViewEncapsulation.None is set');
  });

  describe('valid view encapsulation', () => {
    it('should succeed if ViewEncapsulation.Native is set');
    it('should succeed if ViewEncapsulation.Emulated is set');
  });
});
